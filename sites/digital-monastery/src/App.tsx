import { FormEvent, useState } from "react";
import {
  certainty,
  closing,
  commitments,
  faqs,
  fit,
  hero,
  mechanics,
  navigation,
  steps,
  values,
} from "./copy";

function ApplyLink({ compact = false }: { compact?: boolean }) {
  return (
    <a className={compact ? "apply-link apply-link--compact" : "apply-link"} href="#apply">
      {hero.cta}
      <span className="apply-link__dot" aria-hidden="true" />
    </a>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="A ten-week path from the current state to one result">
      <div className="hero-visual__top">
        <span className="micro-label">YOUR TEN WEEKS</span>
        <span className="status-dot">
          <span />
          One result
        </span>
      </div>
      <div className="trajectory">
        <div className="trajectory__labels">
          <div>
            <span className="trajectory__letter">A</span>
            <p>Where the company stands today</p>
          </div>
          <div className="trajectory__end">
            <span className="trajectory__letter">B</span>
            <p>The result you choose</p>
          </div>
        </div>
        <svg viewBox="0 0 600 220" role="img" aria-label="Ten points rising from Point A to Point B">
          <path
            className="trajectory__guide"
            d="M22 190 C150 180 198 146 296 139 C390 132 452 72 578 28"
            pathLength="1"
          />
          <path
            className="trajectory__line"
            d="M22 190 C150 180 198 146 296 139 C390 132 452 72 578 28"
            pathLength="1"
          />
          {[
            [22, 190],
            [85, 183],
            [148, 169],
            [211, 148],
            [274, 140],
            [337, 132],
            [400, 108],
            [463, 72],
            [526, 45],
            [578, 28],
          ].map(([x, y], index) => (
            <circle
              className={index === 0 || index === 9 ? "trajectory__dot trajectory__dot--edge" : "trajectory__dot"}
              cx={x}
              cy={y}
              key={`${x}-${y}`}
              r={index === 0 || index === 9 ? 6 : 4}
              style={{ animationDelay: `${index * 70}ms` }}
            />
          ))}
        </svg>
        <div className="trajectory__weeks" aria-hidden="true">
          <span>W1</span>
          <span>W5</span>
          <span>W10</span>
        </div>
      </div>
      <div className="hero-visual__foot">
        <span>Commit weekly</span>
        <span>Update daily</span>
        <span>Show evidence</span>
      </div>
    </div>
  );
}

function ValueVisual({ kind }: { kind: string }) {
  if (kind === "resources") {
    return (
      <div className="value-demo value-demo--resources">
        <div className="resource-row">
          <span>cyber•Fund investment review</span>
          <span className="tag tag--selected">Selected</span>
        </div>
        <div className="resource-row">
          <span>Partner credits</span>
          <span className="tag">Conditional</span>
        </div>
        <div className="resource-row">
          <span>Partner discounts</span>
          <span className="tag">Conditional</span>
        </div>
        <p className="demo-note">Every live resource is named before you rely on it.</p>
      </div>
    );
  }

  if (kind === "accountability") {
    return (
      <div className="value-demo value-demo--coach">
        <div className="coach-head">
          <span className="coach-pulse" />
          <span>CONTEXTUAL AI COACH</span>
          <span>WEEK 04</span>
        </div>
        <div className="coach-message coach-message--system">
          You committed to get three teams into a live trial. What changed?
        </div>
        <div className="coach-message coach-message--founder">
          Two started. One paused after security review.
        </div>
        <div className="coach-message coach-message--system">
          Then the bottleneck is clear. Fix the security path before adding more leads.
        </div>
        <div className="coach-action">Next commitment: unblock security review</div>
      </div>
    );
  }

  return (
    <div className="value-demo value-demo--community">
      <div className="community-head">
        <span>WEEKLY ROOM</span>
        <span>5 FOUNDERS</span>
      </div>
      <div className="community-line community-line--active">
        <span className="community-mark">01</span>
        <div>
          <strong>Result landed</strong>
          <p>Evidence reviewed by the cohort</p>
        </div>
        <span className="tag tag--proof">Proof</span>
      </div>
      <div className="community-line">
        <span className="community-mark">02</span>
        <div>
          <strong>Plan changed</strong>
          <p>A weak assumption did not survive</p>
        </div>
        <span className="tag">Honest</span>
      </div>
      <div className="community-line">
        <span className="community-mark">03</span>
        <div>
          <strong>Peer helped</strong>
          <p>The next decision got better</p>
        </div>
        <span className="tag">Named</span>
      </div>
    </div>
  );
}

function ApplicationForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const founder = String(form.get("founder") ?? "").trim();
    const company = String(form.get("company") ?? "").trim();
    const result = String(form.get("result") ?? "").trim();

    if (!founder || !company || !result) {
      setMessage("Complete all three fields.");
      return;
    }

    setMessage("");
    const subject = encodeURIComponent(`Digital Monastery application: ${company}`);
    const body = encodeURIComponent(
      `Founder: ${founder}\nCompany: ${company}\n\nThe result worth ten weeks:\n${result}`,
    );
    window.location.href = `mailto:monastery@cyber.fund?subject=${subject}&body=${body}`;
  }

  return (
    <form className="application-form" onSubmit={handleSubmit} noValidate>
      <div className="field-row">
        <label>
          <span>Your name</span>
          <input name="founder" autoComplete="name" placeholder="Name" />
        </label>
        <label>
          <span>Company</span>
          <input name="company" autoComplete="organization" placeholder="Company name" />
        </label>
      </div>
      <label>
        <span>The result worth ten weeks</span>
        <textarea
          name="result"
          rows={3}
          placeholder="What should be true ten weeks from now?"
        />
      </label>
      {message ? (
        <p className="form-error" role="alert">
          {message}
        </p>
      ) : null}
      <div className="form-submit">
        <button type="submit">Apply for a place</button>
        <p>This opens an email to the program team.</p>
      </div>
    </form>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Digital Monastery home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Digital Monastery</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="desktop-apply">
          <ApplyLink compact />
        </div>
        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          <span />
          <span />
          <span />
          <span className="sr-only">Toggle navigation</span>
        </button>
        {menuOpen ? (
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <ApplyLink />
          </nav>
        ) : null}
      </header>

      <main id="top">
        <section className="hero section">
          <div className="hero-copy">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <p className="hero-lead">{hero.lead}</p>
            <div className="hero-actions">
              <ApplyLink />
              <p>{hero.note}</p>
            </div>
          </div>
          <HeroVisual />
        </section>

        <section className="mechanics" aria-label="Program mechanics">
          {mechanics.map(([number, label]) => (
            <div className="mechanic" key={label}>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="value-section section" id="value">
          <div className="section-heading">
            <p className="eyebrow">WHAT YOU GET</p>
            <h2>Three reasons to take part</h2>
            <p>One is guaranteed. Two depend on real availability and separate decisions.</p>
          </div>
          <div className="value-list">
            {values.map((value) => (
              <article className="value-row" id={value.id} key={value.id}>
                <div className="value-copy">
                  <span className="value-index">{value.index}</span>
                  <p className="eyebrow">{value.eyebrow}</p>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                  <p>{value.detail}</p>
                </div>
                <ValueVisual kind={value.accent} />
              </article>
            ))}
          </div>
        </section>

        <section className="how-section section" id="how">
          <div className="section-heading section-heading--wide">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>The company is the work</h2>
            <p>No curriculum. No invented assignments. Every week serves the result you chose.</p>
          </div>
          <ol className="step-list">
            {steps.map((step) => (
              <li key={step.n}>
                <span>{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="commitment-section">
          <div className="commitment-inner">
            <div className="commitment-copy">
              <p className="eyebrow eyebrow--dark">THE COMMITMENT</p>
              <h2>Show up and do the work</h2>
              <p>
                Repeated absence ends your place. The standard is participation, not performance
                theatre.
              </p>
            </div>
            <ul className="commitment-list">
              {commitments.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="certainty-section section">
          <div className="section-heading">
            <p className="eyebrow">SAID PLAINLY</p>
            <h2>Know what you can rely on</h2>
          </div>
          <div className="certainty-list">
            {certainty.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fit-section section" id="fit">
          <div>
            <p className="eyebrow">WHO IT IS FOR</p>
            <h2>{fit.title}</h2>
            <p className="fit-lead">{fit.lead}</p>
            <p className="fit-no">{fit.no}</p>
          </div>
          <ul>
            {fit.yes.map((item) => (
              <li key={item}>
                <span aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="faq-section section" id="faq">
          <div className="section-heading">
            <p className="eyebrow">QUESTIONS</p>
            <h2>Before you apply</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item) => (
              <article className="faq" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing-section section" id="apply">
          <div className="closing-copy">
            <p className="eyebrow">{closing.eyebrow}</p>
            <h2>{closing.title}</h2>
            <p>{closing.text}</p>
          </div>
          <ApplicationForm />
        </section>
      </main>

      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true" />
          <span>Digital Monastery</span>
        </a>
        <p>Built by cyber•Fund</p>
      </footer>
    </div>
  );
}

export default App;
