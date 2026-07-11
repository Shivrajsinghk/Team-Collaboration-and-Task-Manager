function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-base/80">
            <div className="relative flex flex-col items-center px-8 py-8">
                <div className="relative flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full border border-border"></div>
                    <div className="absolute h-24 w-24 animate-spin rounded-full border-[3px] border-transparent border-t-accent"></div>
                    <div className="absolute h-16 w-16 rounded-full border border-border"></div>
                    <div className="absolute h-4 w-4 rounded-full bg-accent"></div>
                    <div className="absolute h-4 w-4 animate-ping rounded-full bg-accent/70"></div>
                </div>                
            </div>
        </div>
    )
}

export default Loading