// The course itself. Edit titles here; paste each lesson's Bunny video id into `video` once it is uploaded.
// `files` are the student pack: `path` is the file's path in the Bunny storage zone.
module.exports = {
  title: "The Claude Editing System",
  subtitle: "From raw video to your own style",
  modules: [
    { title: "Welcome", lessons: [
      { id: "welcome", title: "Why I let Claude edit my videos", video: "" },
      { id: "how-it-works", title: "How the course and the student pack work", video: "" }
    ] },
    { title: "Installation and setup from scratch", lessons: [
      { id: "install", title: "Install Claude, Hyperframes and the helpers", video: "" },
      { id: "test-render", title: "Is it working? Your first test render", video: "" },
      { id: "add-skills", title: "Add the editing system to Claude", video: "" },
      { id: "filming", title: "Film so Claude can edit it: framing, light and sound", video: "" }
    ] },
    { title: "Create a video with me: the basics", lessons: [
      { id: "first-edit", title: "Hand Claude your video", video: "" },
      { id: "captions-popups", title: "Captions, pop-ups and simple effects", video: "" },
      { id: "preview-changes", title: "Preview, ask for changes, export", video: "" }
    ] },
    { title: "Build your own style", lessons: [
      { id: "borrow-styles", title: "Borrow from styles you love", video: "" },
      { id: "brand", title: "Add your brand colours and fonts once", video: "" },
      { id: "save-style", title: "Save it as your own style", video: "" },
      { id: "effects-library", title: "Bigger effects from the effects library", video: "" }
    ] },
    { title: "Optimize your video", lessons: [
      { id: "hooks", title: "Hooks that hold attention", video: "" },
      { id: "repurpose", title: "Turn one video into a carousel and your next script", video: "" },
      { id: "export-post", title: "Export for Instagram and TikTok", video: "" }
    ] },
    { title: "Your next steps", lessons: [
      { id: "recap", title: "Recap: idea to posted video", video: "" }
    ] }
  ],
  files: [
    // { name: "Editing skills (zip)", path: "pack/editing-skills.zip", note: "Add these to Claude in Module 2" },
  ]
};
