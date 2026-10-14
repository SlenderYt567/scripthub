import React from 'react';

const PrivacyView: React.FC = () => (
  <article className="mx-auto max-w-3xl space-y-8 py-8 text-zinc-300">
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Script Hub</p>
      <h1 className="text-4xl font-semibold tracking-tight text-white">Privacy Policy</h1>
      <p className="text-sm text-zinc-500">Last updated: October 14, 2026</p>
    </header>

    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">Information we use</h2>
      <p>When you create an account, our authentication provider processes your email address and login information. If you choose to fill out a profile, publish a script, upload an image, or report a broken link, we process the information you submit for those features. Published scripts, profile details, and uploaded images may be visible to other visitors.</p>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">Storage and service providers</h2>
      <p>We use Supabase to provide authentication, store site content, and host uploaded images. Authentication may use browser storage to keep you signed in. If you begin publishing a script, a draft is saved in your browser's local storage so you can return to it on the same device. You can remove a draft by clearing this site's browser storage.</p>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">Advertising</h2>
      <p>We may use Google AdSense to display ads after the site is approved and advertising is enabled. If enabled, Google and its partners may use cookies or similar technology to show and measure ads, including ads based on visits to this and other sites. You can learn how Google uses information from sites that use its services and manage ad personalization through the links below.</p>
      <ul className="list-disc space-y-1 pl-6">
        <li><a className="underline underline-offset-4 hover:text-white" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information from partner sites</a></li>
        <li><a className="underline underline-offset-4 hover:text-white" href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Google My Ad Center</a></li>
      </ul>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">External links</h2>
      <p>Script, executor, community, and partner links may take you to third-party sites. Their privacy practices are governed by their own policies.</p>
    </section>

    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">Questions and requests</h2>
      <p>For questions about your information or a privacy request, contact the site team through our <a className="underline underline-offset-4 hover:text-white" href="https://discord.gg/JYeMPRWT" target="_blank" rel="noopener noreferrer">community Discord</a>. Please do not post private account details in public channels.</p>
    </section>
  </article>
);

export default PrivacyView;
