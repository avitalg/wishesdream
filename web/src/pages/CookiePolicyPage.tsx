import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.js';

export function CookiePolicyPage() {
  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">Cookie Policy</p>
        <h1>How we use cookies and browser storage</h1>
        <p className="content-lead">
          WishesDream uses a small amount of browser storage to keep you signed in and to remember
          guest claims. We do not use advertising or tracking cookies.
        </p>

        <section className="content-section">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored by your browser. Similar technologies — such as{' '}
            <strong>local storage</strong> — can also save data on your device. This policy covers
            both cookies and the browser storage WishesDream uses.
          </p>
        </section>

        <section className="content-section">
          <h2>Storage we use</h2>
          <ul className="content-list">
            <li>
              <strong>Host login (local storage):</strong> When you sign in, your session token and
              basic profile are stored in local storage so you stay logged in on that browser.
            </li>
            <li>
              <strong>Guest claims (local storage):</strong> When a guest claims a gift, an
              anonymous token is saved in local storage so they can unclaim their selection from
              the same browser.
            </li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Cookies we do not use</h2>
          <p>
            WishesDream does not set marketing, analytics, or social-media tracking cookies. Host
            authentication is handled with a token in local storage, not a login cookie.
          </p>
        </section>

        <section className="content-section">
          <h2>Third-party content</h2>
          <p>
            Gift lists may display product images loaded from retailer CDNs (for example Amazon or
            Next). Those providers may use their own cookies if you follow a product link to their
            site. Fonts are loaded from Google Fonts when you visit WishesDream.
          </p>
        </section>

        <section className="content-section">
          <h2>Managing storage</h2>
          <p>
            You can clear WishesDream data by signing out (hosts), clearing site data in your browser
            settings, or using a private browsing window. Clearing storage will sign you out and
            remove guest claim tokens on that device.
          </p>
        </section>

        <section className="content-section">
          <h2>More information</h2>
          <p>
            For details on what personal data we collect and how it is used, see our{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </section>
      </article>
    </Layout>
  );
}
