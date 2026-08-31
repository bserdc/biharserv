# BSERV Council — Vacancy form (PHP + MySQL backend)

## 1. Database

```
mysql -u root -p < schema.sql
```

This creates `bserv_council` and the `applications` table. (submit.php also
auto-creates the table on first run if it's missing.)

## 2. Configuration (submit.php, top of file)

| Constant      | What to set                                                     |
|---------------|-----------------------------------------------------------------|
| `DB_HOST`     | Usually `localhost` (or your host's MySQL host)                 |
| `DB_NAME`     | `bserv_council` (or your host's DB name)                        |
| `DB_USER`     | MySQL username                                                  |
| `DB_PASS`     | MySQL password                                                  |
| `ADMIN_EMAIL` | Where new-application notifications go                          |
| `FROM_EMAIL`  | An address on your own domain (best deliverability)             |

## 3. Notifications

On every successful submission:

- **Admin email** — full application details + receipt number + resume filename.
- **Applicant email** — branded acknowledgement with the receipt number
  (e.g. `BSERV-000012`).

Emails use PHP `mail()`. For reliable delivery on shared hosting, swap
`send_mail()` for PHPMailer over SMTP (the function is the only touch point).

## 4. Uploads

- Resume files are saved to `uploads/` with a random suffix.
- Allowed: PDF, DOC, DOCX. Max 2 MB.
- Make sure the web user can write to the folder:
  `mkdir uploads` then on Linux `chmod 775 uploads`.

## 5. Flow

form.html → script.js validates client-side and POSTs `FormData` to
`submit.php` → PHP validates server-side, stores the row, moves the upload,
sends both emails, returns JSON → the acknowledgement box shows the receipt
number and the downloadable HTML receipt is generated client-side.

If the form is served as a plain HTML form (JS disabled), the `action`/
`method`/`enctype` attributes on `.vacancy-form` point at the same
`submit.php`.
