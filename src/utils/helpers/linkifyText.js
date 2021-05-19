import linkifyIt from 'linkify-it'
// import tlds from 'tlds'

const linkify = linkifyIt()
// linkify.tlds(tlds)

const linkifyText = (text) => {
  if (text) {
    let result = text
    const links = linkify.match(text)
    if (links) {
      const urls = links.map(link => link.text)
      const uniqueUrls = urls.filter((v, i, a) => a.indexOf(v) === i)
      if (uniqueUrls) {
        uniqueUrls.map(href => {
          let cleanUrlRe = href.replace('.</p', '').replace(',</p', '').replace(';</p', '')
          let cleanUrl = cleanUrlRe
          if (cleanUrl.indexOf('https') === -1 || cleanUrl.indexOf('http') === -1) {
            cleanUrl = 'https://' + cleanUrl
          }
          const re = new RegExp(cleanUrlRe, 'ig')
          if (cleanUrl.includes('ryfma.com')) {
            result = result.replace(re, `<a href='${cleanUrl}' class='away-link' rel='ugc'>${cleanUrl}</a>`)
          } else {
            result = result.replace(re, `<a href='${cleanUrl}' class='away-link' rel='nofollow noopener ugc' target='_blank'>${cleanUrl}</a>`)
          }
        })
      }
    }
    return result
  } else {
    return text
  }
}

export default linkifyText
