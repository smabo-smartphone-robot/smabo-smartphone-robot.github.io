// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import partytown from '@astrojs/partytown';

// smabo site on Starlight. Japanese is the root locale (/, /guides/…),
// English lives under /en/ (/en/, /en/guides/…).
export default defineConfig({
	site: 'https://smabo-smartphone-robot.github.io',
	// Text exactly as written: no automatic curly quotes or dashes.
	markdown: { smartypants: false },
	integrations: [
		// Runs third-party scripts marked type="text/partytown" (e.g. analytics)
		// in a web worker so they don't slow the page. dataLayer.push is
		// forwarded for Google Analytics (gtag).
		partytown({ config: { forward: ['dataLayer.push'] } }),
		starlight({
			title: 'smabo',
			// Fail the build on broken links between pages and to headings.
			plugins: [starlightLinksValidator()],
			favicon: '/favicon.ico',
			// Page title with the guide's one-line summary under it.
			components: { PageTitle: './src/components/PageTitle.astro' },
			// Code blocks as plain frames (no terminal-window title added).
			expressiveCode: { defaultProps: { frame: 'code' } },
			logo: { src: './src/assets/smabo_icon.png', alt: 'smabo' },
			defaultLocale: 'root',
			locales: {
				root: { label: '日本語', lang: 'ja' },
				en: { label: 'English', lang: 'en' },
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/smabo-smartphone-robot' },
			],
			customCss: [
				'./src/styles/smabo.css',
				'./src/styles/roadmap.css',
				'./src/styles/sysmap.css',
			],
			head: [
				// Google Search Console ownership (carried over from the old site)
				{ tag: 'meta', attrs: { name: 'google-site-verification', content: 'LUX9NyWTg4WhdFdIDHpMdgfZo5dcw49qeZiwvSGfwuY' } },
				{ tag: 'link', attrs: { rel: 'icon', type: 'image/png', href: '/images/smabo_icon.png' } },
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
					},
				},
				// Roadmap and system diagrams.
				{ tag: 'script', attrs: { src: '/js/roadmap.js', defer: true } },
				{ tag: 'script', attrs: { src: '/js/sysmap.js', defer: true } },
				// 起動手順 popup and the top page's scroll reveal.
				{ tag: 'script', attrs: { src: '/js/site.js', defer: true } },
			],
			// Grouped and ordered like the roadmap (roadmap.js). The design doc
			// (/architecture/design/) is reached by URL only, as before.
			sidebar: [
				{
					label: 'セットアップと基本機能',
					translations: { en: 'Setup & core features' },
					items: [
						{ label: '🧠 smabo-brain', translations: { en: "🧠 smabo-brain" }, slug: 'guides/smabo-brain' },
						{ label: '🖥️ smabo-web', translations: { en: "🖥️ smabo-web" }, slug: 'guides/smabo-web' },
						{ label: '📱 smabo-app', translations: { en: "📱 smabo-app" }, slug: 'guides/smabo-app' },
						{ label: '😊 smaboの顔', translations: { en: "😊 smabo's Face" }, slug: 'guides/smabo_face' },
						{ label: '📲 スマホセンサ', translations: { en: "📲 Phone Sensors" }, slug: 'guides/smabo_sensors' },
						{ label: '🎤 音声処理', translations: { en: "🎤 Audio Processing" }, slug: 'guides/audioproc' },
						{ label: '👁️ 画像処理', translations: { en: "👁️ Image Processing" }, slug: 'guides/imgproc' },
					],
				},
				{
					label: 'ハードウェア',
					translations: { en: 'Hardware' },
					items: [
						{ label: '🧩 ベースパーツの作成', translations: { en: "🧩 Base Parts" }, slug: 'guides/base' },
						{ label: '🔌 smabo-esp32', translations: { en: "🔌 smabo-esp32" }, slug: 'guides/smabo-esp32' },
						{ label: '🤏 ハンド', translations: { en: "🤏 Hand" }, slug: 'guides/hand' },
						{ label: '🔄 首振り', translations: { en: "🔄 Head Rotation" }, slug: 'guides/neck' },
						{ label: '🚗 移動ロボット', translations: { en: "🚗 Mobile Robot" }, slug: 'guides/mobile' },
						{ label: '🦾 ロボットアーム', translations: { en: "🦾 Robot Arm" }, slug: 'guides/arm' },
						{ label: '⚙️ エンコーダ付', translations: { en: "⚙️ w/ Encoder" }, slug: 'guides/encmobile', badge: { text: { ja: '準備中', en: 'Coming soon' }, variant: 'note' } },
					],
				},
				{
					label: 'ROS',
					translations: { en: 'ROS' },
					items: [
						{ label: '🤖 brain-ros', translations: { en: "🤖 brain-ros" }, slug: 'guides/brainros', badge: { text: { ja: '準備中', en: 'Coming soon' }, variant: 'note' } },
						{ label: '🗺️ ナビゲーション', translations: { en: "🗺️ Navigation" }, slug: 'guides/nav', badge: { text: { ja: '準備中', en: 'Coming soon' }, variant: 'note' } },
						{ label: '📐 動作計画', translations: { en: "📐 Motion Planning" }, slug: 'guides/plan', badge: { text: { ja: '準備中', en: 'Coming soon' }, variant: 'note' } },
					],
				},
			],
		}),
	],
});
