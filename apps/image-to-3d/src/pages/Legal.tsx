import { useState } from "react";
import { Icon } from "../components/Icon";
import { Dialog, ThemeToggle, ToastProvider, useToast } from "../components/ui";
import { api, type Session } from "../lib/api";
import { Link, navigate } from "../lib/router";

export const LEGAL_UPDATED = "19 October 2026";

function Contact({ session }: { session: Session }) {
  return session.contactEmail ? (
    <a href={`mailto:${session.contactEmail}`}>{session.contactEmail}</a>
  ) : (
    <>the site owner</>
  );
}

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <main className="page legal">
        <div className="page-head">
          <Link href="/" className="btn small">
            <Icon name="arrowLeft" size={16} /> Back
          </Link>
          <ThemeToggle />
        </div>
        <article className="glass card prose">
          <h1>{title}</h1>
          <p className="muted">
            Last updated {LEGAL_UPDATED}. This is a free beta; the terms may
            change and you'll be asked to agree again when they do.
          </p>
          {children}
        </article>
      </main>
    </ToastProvider>
  );
}

export function TermsPage({ session }: { session: Session }) {
  return (
    <Shell title="Terms of use">
      <h2>What this is</h2>
      <p>
        Image to 3D turns one to three pictures of an object into a stylised 3D
        model using an AI model (Claude, by Anthropic). It is a free, private
        beta, provided as is, with no promise it will stay available or that
        results will be accurate.
      </p>
      <h2>Your account</h2>
      <p>
        You sign in with Google and need an invite code to create an account.
        You are responsible for what you upload. The free plan includes 5 models
        per calendar month and a daily usage limit; we may change limits at any
        time.
      </p>
      <h2>What you may upload</h2>
      <p>
        Only pictures you have the right to use. Do not upload, and we will
        block:
      </p>
      <ul>
        <li>sexual or nude content;</li>
        <li>photos of children or teenagers;</li>
        <li>photos in which a real person's face can be recognised;</li>
        <li>graphic violence, gore or self-harm;</li>
        <li>real or realistic weapons;</li>
        <li>hate symbols or content that demeans people;</li>
        <li>
          anything illegal, or anything that infringes someone else's rights.
        </li>
      </ul>
      <p>
        Every image is checked automatically before it is processed. Repeated
        blocked uploads pause your uploads for the rest of the day, and we may
        suspend or delete accounts that misuse the service.
      </p>
      <h2>Your models</h2>
      <p>
        You own the models you make from your own images, subject to the rights
        in the originals. Models are private to you unless you share one by
        link; anyone with the link can view and download it, and anyone can
        report it. We may remove a shared model that is reported or that breaks
        these terms. Source photos are deleted 24 hours after upload and models
        after 30 days, so download what you want to keep.
      </p>
      <h2>No warranty, limited liability</h2>
      <p>
        The service is provided without warranties of any kind. To the extent
        the law allows, we are not liable for lost data or for any indirect or
        consequential loss. Nothing here limits liability that cannot be limited
        by law.
      </p>
      <h2>Contact</h2>
      <p>
        Questions, reports and takedown requests: <Contact session={session} />.
        See also the <Link href="/privacy">Privacy policy</Link>.
      </p>
    </Shell>
  );
}

export function PrivacyPage({
  session,
  onChanged,
}: {
  session: Session;
  onChanged: () => Promise<void>;
}) {
  return (
    <Shell title="Privacy policy">
      <h2>What we collect</h2>
      <ul>
        <li>
          Your name and email address from Google when you sign in, and the
          invite code you used.
        </li>
        <li>
          The pictures you upload, the 3D model and spec made from them, and the
          title and tags you give it.
        </li>
        <li>
          Usage counts (models made, compute used) to apply limits, and your IP
          address, briefly, to rate-limit requests.
        </li>
        <li>
          Security logs. They record events (a request failed, an image was
          blocked) with account and request identifiers and, for blocked images,
          a one-way hash of the image. They never contain your pictures.
        </li>
      </ul>
      <h2>Who processes it</h2>
      <p>
        Your pictures are sent to Anthropic's API to check them and to build the
        model; Anthropic processes them under its own terms and privacy policy.
        Files are stored with Vercel (Blob storage), and accounts and limits
        with Upstash. Sign-in is handled by Google. We do not sell your data or
        show ads, and we don't use your pictures for anything else.
      </p>
      <h2>Who can see your models</h2>
      <p>
        Only you, by default. Files are kept in a private area under your
        account and served only through links that expire after an hour. If you
        share a model by link, anyone with the link can see it (never your
        original photos), and you can stop sharing at any time.
      </p>
      <h2>How long we keep it</h2>
      <ul>
        <li>Source photos: deleted 24 hours after upload.</li>
        <li>
          Models, thumbnails and specs: deleted 30 days after they are saved.
        </li>
        <li>Pictures that are blocked are never stored.</li>
        <li>
          Your account record stays until you delete the account. Security logs
          are kept by our host for a short period.
        </li>
      </ul>
      <h2>Photos from your device</h2>
      <p>
        Before anything is processed, each image is re-encoded on our server,
        which removes hidden metadata such as GPS location and camera details.
      </p>
      <h2>Your choices</h2>
      <p>
        You can delete any model, delete all your models, or delete your account
        and everything with it at any time (below, once signed in). To ask us
        anything else about your data, contact <Contact session={session} />.
      </p>
      {session.authenticated && session.user && (
        <YourData session={session} onChanged={onChanged} />
      )}
      <p>
        See also the <Link href="/terms">Terms of use</Link>.
      </p>
    </Shell>
  );
}

function YourData({
  session,
  onChanged,
}: {
  session: Session;
  onChanged: () => Promise<void>;
}) {
  const toast = useToast();
  const [open, setOpen] = useState<null | "all" | "account">(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const email = session.user!.email;
  const run = async () => {
    setBusy(true);
    try {
      if (open === "all") {
        await api.removeAll();
        toast("All your models were deleted");
        setOpen(null);
      } else {
        await api.deleteAccount(typed);
        await onChanged();
        navigate("/");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-label="Your data">
      <h2>Your data</h2>
      <div className="actions">
        <button
          type="button"
          className="btn danger"
          onClick={() => setOpen("all")}
        >
          <Icon name="trash" size={16} /> Delete all my models
        </button>
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            setTyped("");
            setOpen("account");
          }}
        >
          <Icon name="trash" size={16} /> Delete my account
        </button>
      </div>
      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        title={
          open === "all" ? "Delete all your models?" : "Delete your account?"
        }
      >
        <p className="muted">
          {open === "all"
            ? "Every model, GLB, thumbnail, photo and share link is permanently removed."
            : "Your account, every model, photo and share link are permanently removed. This can't be undone."}
        </p>
        {open === "account" && (
          <div className="field">
            <label className="field-label" htmlFor="confirm-email">
              Type <strong>{email}</strong> to confirm
            </label>
            <input
              id="confirm-email"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </div>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="btn"
            onClick={() => setOpen(null)}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn danger"
            disabled={
              busy ||
              (open === "account" && typed.trim().toLowerCase() !== email)
            }
            onClick={() => void run()}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Dialog>
    </section>
  );
}

/** Shown after sign-in until the user agrees to the current Terms and Privacy Policy. */
export function ConsentPage({
  session,
  onDone,
}: {
  session: Session;
  onDone: () => Promise<void>;
}) {
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <main className="center-screen">
      <form
        className="glass card narrow"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api.consent();
            await onDone();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setBusy(false);
          }
        }}
      >
        <h1>One last thing</h1>
        <p className="muted">
          Signed in as {session.user?.email}. Before you start, please read how
          this works.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer">
              Terms of use
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noreferrer">
              Privacy policy
            </a>
            , and I'll only upload images I have the right to use, with no
            sexual content, children, recognisable faces, graphic violence,
            weapons or hate symbols.
          </span>
        </label>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <button
          className="btn primary block"
          type="submit"
          disabled={!agree || busy}
        >
          {busy ? "Saving…" : "Continue"}
        </button>
        <button
          className="btn block"
          type="button"
          onClick={() => void api.logout().then(onDone)}
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
