import ReactMarkdown from 'react-markdown'

// Renders a product description written in markdown, including inline images
// (standard `![alt](url)` pointing at uploaded Storage URLs). Rendered elements
// are styled with Tailwind arbitrary-variant selectors, so no custom component
// typing is needed.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 leading-relaxed text-stone-700 [&_a]:text-emerald-700 [&_a]:underline [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_img]:my-3 [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}
