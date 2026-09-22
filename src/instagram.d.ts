// The embed script attaches itself to the window; it ships no types.
interface InstgrmEmbeds { process(): void }
interface Window { instgrm?: { Embeds: InstgrmEmbeds } }
