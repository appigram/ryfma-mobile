import React, {
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'

const DEFAULT_STATE = {
  rTheme: '',
  readAnounce: 0,
  readWebPush: 0,
  feedView: 'default'
}

function createContextValue ({ rTheme, readCookie, readAnounce, readWebPush, isMobile, isTablet, isAMP, feedView,
setRTheme, setReadCookie, setReadAnounce, setReadWebPush, setMobile, setTablet, setFeedView }) {
  return {
    rTheme, readCookie, readAnounce, readWebPush, feedView,
    setRTheme, setReadCookie, setReadAnounce, setReadWebPush, setFeedView,
    setRTheme: (rTheme) => setRTheme(rTheme),
    setReadCookie: (readCookie) => setReadCookie(readCookie),
    setReadAnounce: (readAnounce) => setReadAnounce(readAnounce),
    setFeedView: (view) => setFeedView(view)
    // clearSettings: () => setState({ rTheme, readCookie, readAnounce, readWebPush, isMobile, isTablet, })
  }
}

const SettingsContext = createContext(
  createContextValue({
    ...DEFAULT_STATE,
    setState: () =>
      console.error('You are using SettingsContext without SettingsProvider!')
  }),
)

export function useSettings () {
  return useContext(SettingsContext)
}

export function SettingsProvider ({ context, children }) {
  const [rTheme, setRTheme] = useState(context.rTheme || DEFAULT_STATE.rTheme)
  const [readCookie, setReadCookie] = useState(context.readCookie || DEFAULT_STATE.readCookie)
  const [readAnounce, setReadAnounce] = useState(context.readAnounce || DEFAULT_STATE.readAnounce)
  const [readWebPush, setReadWebPush] = useState(context.readWebPush || DEFAULT_STATE.themreadWebPushe)
  const [feedView, setFeedView] = useState(context.feedView || DEFAULT_STATE.feedView)

  const contextValue = useMemo(() => {
    return createContextValue({
      rTheme, readCookie, readAnounce, readWebPush, feedView,
      setRTheme, setReadCookie, setReadAnounce, setReadWebPush, setFeedView
    })
  }, [rTheme, readCookie, readAnounce, readWebPush, feedView,
    setRTheme, setReadCookie, setReadAnounce, setReadWebPush, setFeedView])

  return (
    <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>
  )
}
