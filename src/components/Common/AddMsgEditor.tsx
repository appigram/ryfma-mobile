import React, { useRef, useEffect, useState } from 'react'
import Editor from '@draft-js-plugins/editor'
import { Text, View, Button } from '~components/Themed'
// import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js'
import {getDefaultKeyBinding} from 'draft-js'

// const {hasCommandModifier} = KeyBindingUtil

function AddMsgEditor ({ editorState, id, editorClassName, placeholder, onChange, handleSubmit, sendByEnter }) {
  const editorRef = useRef(null)

  const [editorPlaceholder, setEditorPlaceholder] = useState(placeholder)
  const [emojiPlugin, setEmojiPlugin] = useState(null)

  useEffect(() => {
    const loadEmojiPlugin = async () => {
      const module = await import('@draft-js-plugins/emoji')
      const createEmojiPlugin = module.default
      const loadedEmojiPlugin = createEmojiPlugin({
        // useNativeArt: true,
        toneSelectOpenDelay: 300,
        priorityList: {
          ':see_no_evil:': ["1f648"],
          ':raised_hands:': ["1f64c"],
          ':100:': ["1f4af"],
        }
      })

      setEmojiPlugin(loadedEmojiPlugin)
    }
    if (typeof window !== 'undefined' && !emojiPlugin) {
      loadEmojiPlugin()
    }
  }, [])

  const handleFocus = () => {
    if (editorRef) {
      editorRef.current.focus()
      setEditorPlaceholder('')
    }
  }

  const myKeyBindingFn = (e) => {
    if (e.keyCode === 13 /* `Enter` key */) { // } && hasCommandModifier(e)) {
    	if (e.nativeEvent.shiftKey) {
    		// Alt + Enter
    	} else {
    		// Enter
        if (sendByEnter) {
          return 'editor-send'
        }
    	}
    }
    return getDefaultKeyBinding(e)
  }

  const handleKeyCommand = (command) => {
    if (command === 'editor-send') {
      // Perform a request to save your contents, set
      // a new `editorState`, etc.
      if (sendByEnter) {
        handleSubmit()
      }
      return 'handled'
    }
    return 'not-handled'
  }

  if (typeof window !== 'undefined' && !!emojiPlugin) {
    const { EmojiSuggestions, EmojiSelect } = emojiPlugin

    return (<>
      <View id={id} className='review-editor' onClick={handleFocus}>
        <Editor
          ref={editorRef}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={myKeyBindingFn}
          onChange={onChange}
          plugins={[emojiPlugin]}
          editorClassName={editorClassName}
          placeholder={editorPlaceholder}
          spellCheck
          stripPastedStyles
        />
        <EmojiSuggestions />
      </View>
      <View className='emoji-picker'>
        <EmojiSelect />
      </View>
    </>)
  }

  // for SSR render
  return <>
    <View id={id} className='review-editor' onClick={handleFocus}>
      <View className='DraftEditor-root' />
    </View>
    <View className='emoji-picker' />
  </>
}

export default AddMsgEditor
