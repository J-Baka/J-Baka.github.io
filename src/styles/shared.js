import { css } from 'lit';

/* Shared styles included by section components. Tokens are inherited
   from :root via global.css (custom properties pierce shadow DOM). */
export const sharedStyles = css`
  :host {
    display: block;
  }

  .section {
    padding: clamp(3.5rem, 8vw, 6rem) var(--gutter);
  }

  .container {
    max-width: var(--content-width);
    margin: 0 auto;
  }

  .eyebrow {
    font-family: var(--ff-mono);
    font-size: var(--fs-small);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: var(--fw-semibold);
    margin: 0 0 0.6rem;
  }

  h2 {
    font-size: var(--fs-h2);
    font-weight: var(--fw-black);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin: 0 0 1rem;
  }

  .lead {
    color: var(--text-muted);
    max-width: 60ch;
    margin: 0 0 2.5rem;
  }

  a {
    color: var(--accent);
  }
`;
