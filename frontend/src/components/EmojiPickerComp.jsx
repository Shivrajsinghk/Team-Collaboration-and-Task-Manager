import React from 'react'
import EmojiPicker from "emoji-picker-react";

function EmojiPickerComp({showEmojiPicker, onEmojiSelect}) {
    return (
        <div>
            {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-50">
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            onEmojiSelect(emojiData.emoji)
                        }}
                    />
                </div>
            )}
        </div>
    )
}
export default EmojiPickerComp
