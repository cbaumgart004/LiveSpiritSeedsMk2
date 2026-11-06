// /connect: the newsletter signup and the ways to follow along, on one page,
// after the owner's Kit landing page (Kit's "Abbey" template): a photo across
// the page under a tint, her portrait, heading and message on one side and the
// signup on the other, stacked on a phone. Every button named Connect (under
// the menu bar, in the menu, in the footer) and any section button linking to
// /connect lands here.
//
// Faces and colors are the site's own (--font-heading, --font-body, the
// season's tokens), so the page follows the season and the owner's fonts; the
// photo is hers (connectBackground) or the season's watercolor.
import Nav from '../components/Nav'
import ActionBar from '../components/ActionBar'
import SiteFooter from '../components/SiteFooter'
import NewsletterForm from '../components/NewsletterForm'
import SocialIcons, { socialItems } from '../components/SocialIcons'
import { useDocuments, useSettings } from '../cms/site'
import { altOf, imageStyle, srcOf } from '../components/cms/photo'
import '../styles/connect.css'

const PORTRAIT = '/uploads/connect-portrait.jpg'
const TITLE = 'Subscribe to our newsletter'
const INTRO = 'Welcome to a journey of healing and transformation! Subscribe to our newsletter for insights on trauma-informed yoga, neuroscience-based massage practices, and holistic wellness tips. Join our community today!'
const FINE_PRINT = 'We respect your privacy. Unsubscribe at any time.'

export default function ConnectPage() {
  const { settings } = useSettings()
  const { docs } = useDocuments('page')
  const portrait = srcOf(settings.connectPortrait || PORTRAIT)
  const photo = srcOf(settings.connectBackground)
  const socials = (settings.socials || []).filter((s) => s?.label && s?.url)
  const hasSocial = socialItems(settings).length > 0 || socials.length > 0

  return (
    <>
      <Nav />
      <ActionBar />
      <main className="connect first-section" style={photo ? { '--connect-photo': `url("${photo}")` } : undefined}
        data-eotm-edit="settings:settings" data-eotm-label="connect page" data-eotm-field="connectBackground">
        <div className="connect__inner">
          <div className="connect__about">
            {portrait && (
              <img className="connect__portrait" src={portrait} alt={altOf(settings.connectPortrait, 'Melissa')}
                style={imageStyle(settings.connectPortrait)} data-eotm-field="connectPortrait" />
            )}
            <h1 className="connect__title" data-eotm-field="connectTitle" data-eotm-text="connectTitle">
              {settings.connectTitle || TITLE}
            </h1>
            <p className="connect__intro" data-eotm-field="connectIntro" data-eotm-text="connectIntro">
              {settings.connectIntro || INTRO}
            </p>
          </div>

          <div className="connect__join">
            {settings.newsletterFormId && (
              <NewsletterForm
                formId={settings.newsletterFormId}
                placeholder="Email Address"
                buttonLabel="Subscribe"
                finePrint={FINE_PRINT}
              />
            )}
            {hasSocial && (
              <div className="connect__social">
                <h2 className="connect__social-title">Connect on Social Media</h2>
                <SocialIcons settings={settings} />
                {socials.length > 0 && (
                  <ul className="connect__links">
                    {socials.map((s) => (
                      <li key={s._id ?? s.label}>
                        <a className="btn" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter pages={docs} />
    </>
  )
}
