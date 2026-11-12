import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * How to test an AI agent's answer.
 *
 * AI answers change wording every time, even when they are correct, so this is a FLAKY test:
 *
 *   await expect(answer).toHaveText('The prior authorization for member TEST-001 was approved on March 3.');
 *
 * Instead:
 *   1. Fake the agent's answer with page.route() to test that OUR SCREEN works.
 *   2. Check the KEY FACTS (approved, March 3), not the exact sentence.
 *   3. Use synthetic test members (TEST-001), never real member IDs (PHI).
 *   4. Wait for the answer to finish before checking it.
 *   5. Check the agent says "not found" instead of making something up.
 *
 * There is no real AI here: a small chat page and the agent's API are both served by page.route(),
 * the same way a test would fake a real agent endpoint.
 */

const APP_URL = 'https://mock-assistant.test/';

const chatHtml = `
  <h1>Prior authorization assistant</h1>
  <label for="question">Ask a question</label>
  <input id="question" type="text" />
  <button id="send">Send</button>
  <p id="typing" data-test="agent-typing" hidden>Assistant is typing...</p>
  <div id="answer" data-test="agent-response" role="log"></div>
  <script>
    document.getElementById('send').onclick = async () => {
      const typing = document.getElementById('typing');
      const answer = document.getElementById('answer');
      answer.textContent = '';
      typing.hidden = false;
      try {
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: document.getElementById('question').value }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        answer.textContent = (await res.json()).answer;
      } catch (e) {
        answer.textContent = 'The assistant is unavailable right now. Please try again.';
      } finally {
        typing.hidden = true;
      }
    };
  </script>`;

/** Opens the chat page; the agent's reply is decided by the test. */
async function openAssistant(page: Page) {
  await page.route(APP_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: chatHtml }),
  );
  await page.goto(APP_URL);
}

async function ask(page: Page, question: string) {
  await page.getByLabel('Ask a question').fill(question);
  await page.getByRole('button', { name: 'Send' }).click();
  // Wait until the agent has finished answering
  await expect(page.getByTestId('agent-typing')).toBeHidden();
}

test.describe('AI agent: prior authorization answers', () => {
  // The same correct facts, worded three different ways, like a real AI might answer.
  const correctAnswers = [
    'The prior authorization for member TEST-001 was approved on March 3.',
    "Good news! Member TEST-001's request was Approved (decision date: Mar 3, 2026).",
    'Status: APPROVED. Decided 3/3/2026 for TEST-001.',
  ];

  for (const [i, wording] of correctAnswers.entries()) {
    test(`key facts pass for any correct wording (version ${i + 1})`, async ({ page }) => {
      await page.route('**/api/agent', (route) => route.fulfill({ status: 200, json: { answer: wording } }));
      await openAssistant(page);

      await ask(page, 'What is the prior authorization status for member TEST-001?');

      const answer = page.getByTestId('agent-response');
      await expect(answer).toContainText(/approved/i); // key fact 1
      await expect(answer).toContainText(/march 3|mar 3|3\/3/i); // key fact 2
      await expect(answer).toContainText('TEST-001'); // the right member
      await expect(answer).not.toContainText(/denied|pending/i); // nothing contradicting
    });
  }

  test('catches a wrong answer (wrong status)', async ({ page }) => {
    await page.route('**/api/agent', (route) =>
      route.fulfill({ status: 200, json: { answer: "Member TEST-001's request was denied on March 3." } }),
    );
    await openAssistant(page);
    await ask(page, 'What is the prior authorization status for member TEST-001?');

    // Proves the key-fact checks really fail on a wrong answer: "approved" is missing.
    await expect(page.getByTestId('agent-response')).not.toContainText(/approved/i);
  });

  test('waits for a slow answer and shows a typing indicator', async ({ page }) => {
    await page.route('**/api/agent', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // slow agent
      await route.fulfill({ status: 200, json: { answer: 'TEST-001: approved on March 3.' } });
    });
    await openAssistant(page);

    await page.getByLabel('Ask a question').fill('Status for TEST-001?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByTestId('agent-typing')).toBeVisible(); // loading state shows
    await expect(page.getByTestId('agent-typing')).toBeHidden(); // then disappears
    await expect(page.getByTestId('agent-response')).toContainText(/approved/i);
  });

  test('does not make up an answer for a member that does not exist', async ({ page }) => {
    await page.route('**/api/agent', (route) =>
      route.fulfill({ status: 200, json: { answer: 'I could not find a member with ID TEST-404.' } }),
    );
    await openAssistant(page);
    await ask(page, 'What is the prior authorization status for member TEST-404?');

    const answer = page.getByTestId('agent-response');
    await expect(answer).toContainText(/could not find|couldn't find|no record|not found/i);
    await expect(answer).not.toContainText(/approved|denied/i); // no invented status
  });

  test('shows a friendly message when the agent fails', async ({ page }) => {
    await page.route('**/api/agent', (route) => route.fulfill({ status: 500 }));
    await openAssistant(page);
    await ask(page, 'Status for TEST-001?');

    await expect(page.getByTestId('agent-response')).toHaveText(
      'The assistant is unavailable right now. Please try again.',
    );
  });

  test('sends the question to the agent API', async ({ page }) => {
    let sentQuestion = '';
    await page.route('**/api/agent', async (route) => {
      sentQuestion = route.request().postDataJSON().question; // inspect what the page sent
      await route.fulfill({ status: 200, json: { answer: 'TEST-001: approved on March 3.' } });
    });
    await openAssistant(page);
    await ask(page, 'What is the prior authorization status for member TEST-001?');

    expect(sentQuestion).toBe('What is the prior authorization status for member TEST-001?');
  });
});
