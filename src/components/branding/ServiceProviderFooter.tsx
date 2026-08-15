import innerMirrorLogo from "../../../assets/logo/IM_LOGO.png";

const GITHUB_REPOSITORY_BASE_URL =
  "https://github.com/fribot-labs/innermirror-landing/blob/main";

const POLICY_LINKS = [
  {
    label: "Privacy Policy",
    href: `${GITHUB_REPOSITORY_BASE_URL}/PRIVACY_KO.md`,
  },
  {
    label: "Terms of Service",
    href: `${GITHUB_REPOSITORY_BASE_URL}/TERMS_KO.md`,
  },
  {
    label: "Legal Foundation",
    href: `${GITHUB_REPOSITORY_BASE_URL}/docs/legal/LEGAL_FOUNDATION.md`,
  },
  {
    label: "Production Validation",
    href: `${GITHUB_REPOSITORY_BASE_URL}/docs/PRODUCTION_VALIDATION.md`,
  },
] as const;

export function ServiceProviderFooter() {
  return (
    <footer className="service-provider-footer">
      <div className="service-provider-footer-inner">
        <div className="service-provider-footer-brand">
          <img
            src={innerMirrorLogo}
            alt="InnerMirror"
            className="service-provider-footer-logo"
          />

          <div>
            <strong>InnerMirror</strong>
            <span>Project Reflection & Continuity</span>
          </div>
        </div>

        <div className="service-provider-footer-information">
          <strong>주식회사 프라이봇</strong>

          <span>
            경북 경주시 강동면 동해대로 166-11, 7층
          </span>

          <a href="mailto:mail@fribot.com">
            mail@fribot.com
          </a>
        </div>

        <nav
          className="service-provider-footer-links"
          aria-label="InnerMirror policy documents"
        >
          {POLICY_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="service-provider-footer-copyright">
          © 2026 Fribot Co., Ltd.
        </div>
      </div>
    </footer>
  );
}
