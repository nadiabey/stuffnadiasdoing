import { Database } from "@cloudflare/d1";
import { Resend } from "resend";
import { env } from "cloudflare:workers";

interface Env {
  posts: Database;
};

const SECRET_KEY = env.TURN_KEY;
const RESEND_KEY = env.RESEND_KEY;
const resend = new Resend(RESEND_KEY);

async function validateTurnstile(token, remoteip) {
const formData = new FormData();
formData.append('secret', SECRET_KEY);
formData.append('response', token);
formData.append('remoteip', remoteip);

      try {
          const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              body: formData
          });

          const result = await response.json();
          return result;
      } catch (error) {
          console.error('Turnstile validation error:', error);
          return { success: false, 'error-codes': ['internal-error'] };
      }

}

export const onRequestPost({request, env}) {
  try {
    const submission = await context.request.formData();
    const formname = submission.get("name");
    const formemail = submission.get("email");
    const token = submission.get("cf-turnstile-response");
    const ip = context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('X-Forwarded-For') || 'unknown';
    const validation = await validateTurnstile(token, ip);

      if (validation.success) {
          // Token is valid - process the form
          console.log('Valid submission from:', validation.hostname);
          const stmt = context.env.posts.prepare("INSERT INTO contacts (name, email) VALUES (?, ?)").bind(formname, formemail);
          await stmt.run();
          const new_contact = await resend.contacts.create({
            email: formemail,
            firstName: formname,
         });
         const { data, error } = await resend.contacts.segments.add({
             email: formemail,
             segmentId: '60e7c627-05f8-4e9a-8bfe-dc67d2a5f545',
         });
         await resend.emails.send({
             from: 'Nadia Bey <creating@nadiabey.com>',
             to: formemail,
             subject: 'You signed up for updates from Nadia Bey',
             html: `<p>You have signed up to be notified when Nadia Bey posts a review, analysis, or other content related to public health and pop culture. If you no longer wish to receive these updates, you may unsubscribe by contacting Nadia directly or by clicking the unsubscribe link in the next notification email.</p>`
           });
          return Response.redirect("/?signed-up");
      } else {
          // Token is invalid - reject the submission
          console.log('Invalid token:', validation['error-codes']);
          return new Response('Invalid verification', { status: 400 });
      }
  } catch (err) {
    console.log(err)
    return new Response("Form failed to submit.")
  }
}
