# brandonjhill.com (static site)

Single-page personal site for `brandonjhill.com` built with plain HTML/CSS/vanilla JS. No build step.

## Files

- `index.html`: Content + SEO meta tags + JSON-LD Person schema
- `styles.css`: Theme, layout, cards, modal, responsive styles
- `script.js`: Footer year, smooth scrolling, modal behavior, Formspree submission
- `assets/header-mark.svg`: Two-color header mark (mountain/peak + circuit line)

## Deploy to Cloudflare Pages (no build)

1. **Push to GitHub**
   - Create a repo (or use this one) and push these files to the default branch.

2. **Create a Cloudflare Pages project**
   - In Cloudflare Dashboard: **Workers & Pages → Pages → Create a project**
   - Select **Connect to Git**, then pick your GitHub repo.

3. **Configure build settings**
   - **Framework preset**: None
   - **Build command**: (leave empty)
   - **Build output directory**: `/` (project root)

4. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will publish a `*.pages.dev` URL.

5. **Add custom domain**
   - In the Pages project: **Custom domains → Set up a custom domain**
   - Add `brandonjhill.com` (and `www` if desired), then follow DNS instructions.

## Update assets

- **OG image**
  - Replace the placeholder OG image referenced in `index.html` at `/assets/hero.jpg`.
  - Add your image file to `assets/hero.jpg` (or update the meta tags to match your chosen path).

## Update copy + links

- **Site content**: edit sections in `index.html` (`#about`, `#experience`, `#expertise`, `#projects`, `#contact`)
- **HoldCo link**: the “For Brokers” card links to `https://hillpeakholdings.com/` in `index.html`
- **Formspree endpoint**: update the form attribute `data-formspree-endpoint` in `index.html` if it ever changes


