---
name: effects
description: Apply one of 32 reel editing effects to an uploaded talking head clip. Use when the user writes /effects, /effects plus an effect name (prompt-box, tools-card, before-after, magazine, reel-wall, options, orbit, dm-cta, mascot, checklist, glass-widgets, search-bar, notifications, pixel-title, timeline, comment-reply, airdrop, tweet-card, phone-remote, analytics, dm-inbox, documentary, odometer, spinner, mascot-build, phone-jump, mascot-cool, claude-chat, mascot-talk, cli-welcome, mascot-army, thinking), or asks for one of these effects by name.
---

# /effects

The user has uploaded (or will upload) a raw vertical talking head clip. Edit it with Hyperframes (HTML to MP4). If Hyperframes is not set up yet, set it up first from github.com/heygen-com/hyperframes.

## How to run

- `/effects` with no name: list the 32 effects below with their one line descriptions and ask which one to use.
- `/effects <name>`: apply that effect. `/effects magazine orbit` means apply both, one after the other.
- If no clip is uploaded, ask for one.
- Always render a 1080x1920 preview first and ask what to change. Render the final in 4K (2160x3840) only when the user says it is good.
- Keep all text, cards and stickers inside the safe zone: at least 120 px from the top, 340 px from the bottom and 60 px from the sides (at 1080x1920), so the app buttons never cover them.
- Use one accent color for every effect. If the user has not given one, use orange (#D97757) and ask if they want their own.
- Effects that need the person cut out of the background: use a person matting model (for example Robust Video Matting) to make a transparent cutout video, then layer it above the background elements.
- The Claude mascot (Clawd) is an orange pixel creature: a blocky body with two black eyes, a wider arms row and four little legs, pixels twice as tall as wide. The Claude starburst is orange rays around a small center.
- For the 'crazy' feel use camera shake, a quick white or orange flash and a punch-in zoom on impact moments, plus squash on every landing.
- Let each effect land for 1 to 2 seconds. Keep the clip's own audio unless the user asks to mute it.

## The 32 effects

### prompt-box
One prompt, full edit. Show a white prompt box over the chest that types "Edit this like a pro. Captions, zooms, sound." word by word. Press the orange send button, add an orange glow around the frame, punch in on the face (about 1.12x) and pop in a caption that says "edited like a pro" with the key words highlighted. Keep the prompt box on screen so people can read it.

### tools-card
The only 3 tools. A cream card over the lower part of the frame with the title "The Only 3 Tools" in an italic serif. Show 3 app icons with a name and one line under each: Claude Code (edits the reel), Hyperframes (builds + renders), FFmpeg (cuts + exports). Pop them in one at a time with a little bounce. The user can swap in their own tools.

### before-after
Slider from raw to edit. Left side is the raw clip, right side is the same clip at exactly the same size and framing with a warmer grade, a caption and a sticker. Sweep a white slider line from right to left, then settle in the middle. BEFORE and AFTER labels at the top.

### magazine
Turn the clip into a magazine cover. Cut the person out and put a huge serif title (the user's name or brand, red) behind their head. Small issue line above the title, 2 short cover lines on the left, a round "NEW" sticker and a small barcode in the corner. Start with a quick white camera flash.

### reel-wall
Your reels behind you. Cut the person out and fill the background with 8 thumbnails of the user's own reels (ask for them) as straight cards with a white border and a view count on each. Fly them in from the back one by one and let them float slowly. A pill at the bottom says "5.3M views this month" (ask for the real number).

### options
Raw clip to option A, B or C. Black background, the raw clip at the top with the title "Raw Clip". Below it three versions labeled A, B and C (mono, edited with captions, film look). A cursor hovers A and C, then clicks B: orange ring and green check on B, the other two fade out.

### orbit
Your edits spinning around you. Cut the person out. Make 6 small vertical video cards from the user's own clips and orbit them around the person in a circle at chest height, passing behind and in front. Cards stay straight (never tilted), the ones in the back are smaller, and no card ever covers the face.

### dm-cta
Comment keyword to DM. A bold sticker at the top that says "Comment KEYWORD" (ask for the keyword) with a thick black border and a hard shadow. Small comment bubbles with the keyword float up from the bottom. End with a DM notification from the user's handle that says "sent you the guide".

### mascot
The Claude Code pixel mascot on your chest. Draw the orange pixel mascot (blocky body, two black eyes, wide arms row, four little legs, pixels twice as tall as wide). It peeks up from behind a thin orange line, blinks, then hops twice with a squash on each landing and a few orange pixels flying out. Keep it below the face.

### checklist
Watch Claude tick off the edit. A dark rounded card over the chest titled "Claude is editing your clip" with an "x of 5" counter. Five steps (Found your face, Cut the silences, Added captions, Graded the colour, Rendered in 4K) get ticked one by one with a green check and a small detail on the right.

### glass-widgets
Stats floating around you. Four frosted glass widgets around the person, never over the face: today's views as a big number, a ring that fills while it says "Rendering 4K", a small bar chart of the top reels, and a follower counter ticking up in green. Pop them in one by one and let them float gently.

### search-bar
A search bar types your question. A white rounded search bar over the chest types "how to edit reels with AI" letter by letter. Three suggestions drop down and "how to edit reels with AI in Claude" gets highlighted and tapped.

### notifications
Lock screen notifications stack. iOS-style banners slide in over the chest one after another, pushing the older ones up: Claude "Your reel is rendered in 4K", then likes, a new follower and a "your reel just passed 100K views" alert.

### pixel-title
Claude Code title on top, you below. Split the screen in two. Top half: black with faint orange code falling like rain, a box that says "Welcome to Claude Code!" and a big pixel-font (for example Silkscreen) title "CLAUDE CODE" that glitches in red and cyan for a moment, then settles in orange. Bottom half: the person. A tiny pixel mascot runs and hops along the orange divider line.

### timeline
An editor timeline renders it. Split the screen: on top a cream background with "Claude renders it" and a dark editor window with a video track of thumbnails from the clip, a captions track and a waveform, while a playhead moves across with a percent counter. Bottom half: the person.

### comment-reply
A real looking Instagram comment. An Instagram comment sheet in dark mode over the chest: a follower asks "how do you edit like this?? the effects are insane". The heart gets tapped (count goes up, "liked by creator" appears), then the user's reply slides in under their handle with the verified badge: "it's all Claude. comment CLAUDE and I'll send them". Ask for the user's handle and a photo for the avatar.

### airdrop
AirDrop the finished file. An iOS AirDrop sheet over the chest: "Claude Code would like to share a video" with a thumbnail of the clip and "reel_final_4k.mp4 · 2160x3840". A tap on Accept, a blue progress bar fills, then a green "Saved to Photos".

### tweet-card
A tweet with counting likes. A white tweet card centered on the chest with the user's name, verified badge and handle (ask for them) and a short line like "I haven't opened an editing app in 3 months. Claude does all of it." Replies, reposts and likes count up fast.

### phone-remote
Edit from your phone. A small phone slides in beside the person (never over the face) showing Claude Code with the pixel mascot, "Remote Control · connected". A message "edit my reel" is sent, then "Editing..." and "Done · 4K" appear.

### analytics
Insights graph shoots up. A dark Instagram-style insights card: "Views" counts up to 1.2M, a green "+312% vs. previous 30 days", a smooth purple-pink-orange curve draws in with a glowing end dot, and a followers vs non-followers bar fills.

### dm-inbox
DMs flood in. A dark Instagram DM inbox over the chest with the user's verified handle. New rows slide in at the top one after another, each saying "CLAUDE · now" with a blue unread dot, while the Requests counter climbs.

### documentary
Black and white doc title. The clip turns black and white with a dark top and bottom. Big bold lines "NO EDITOR. NO APPS. JUST CLAUDE." slam in from the left with the last word in the accent color, a lower third with the user's name and handle, and a cursor clicks Follow so it turns into Following.

### odometer
Huge rolling number. Big bold digits on the chest roll like an odometer and land on "30", then "/30" pops in in the accent color. Under it a small terminal pill types "reels edited by claude this month" with a blinking green dot.

### spinner
Claude Code working spinner. A dark terminal card over the chest with the prompt "> edit my reel and make it pop", then the Claude Code spinner line: a spinning star, verbs that change (Clauding, Cutting, Captioning, Grading, Rendering) and a seconds counter. It ends with a green "Done. reel_final_4k.mp4".

### mascot-build
Pixels assemble the mascot. Orange pixels storm in from all over the frame and slam together into a big mascot on the chest. On impact: orange flash, camera shake, punch-in and a shockwave ring with starbursts flying out. Then the mascot squashes, super-jumps with a full spin and slams back down.

### phone-jump
The mascot jumps out of the phone. A small phone with Claude Code and a tiny mascot slides in beside the person. It rattles and glows orange, then the mascot blasts out with a flip, grows huge mid-air and lands on an orange line on the chest with a flash, camera shake and dust. It ends with a backflip.

### mascot-cool
Deal with it. The mascot pops up on the chest. Pixel sunglasses slam down onto its eyes with a punch-in, flash and shake, white glints sparkle on the lenses, "DEAL WITH IT" slams in with an RGB glitch and "EDITED BY CLAUDE" drops in letter by letter while the mascot nods.

### claude-chat
Claude replies, the reel blows up. A cream Claude chat card over the chest: the user asks "make my reel go viral", Claude's reply streams in word by word with a spinning starburst. Then a huge view counter slams in above the head (counting up to 2.1M VIEWS) with an orange flash, shake and a burst of starbursts.

### mascot-talk
Psst, I edited this. A bigger mascot pops up at the side of the chest and vibrates with excitement. A comic speech bubble slams in and the words "PSST... I EDITED THIS WHOLE VIDEO!" punch in one by one in a pixel font, each with a little shake. It ends with a shake, an orange flash and pixel hearts flying up.

### cli-welcome
Claude Code boot and shatter. The Claude Code welcome panel (mascot, "Welcome to Claude Code!", cwd line) glitches in with RGB edges over orange code rain. "/effects" gets typed and suggestions appear. On enter the panel shatters into flying pixels with a flash, shake and punch-in, and the mascot drops from above and lands on the chest.

### mascot-army
Mascot stampede and a boss. Two rows of mascots stampede in from opposite sides along an orange line and do a wave jump. Then a giant boss mascot drops from the sky with a growing shadow, lands with a white flash, heavy shake, punch-in and dust, and the small ones bounce.

### thinking
Thinking, then boom. A cream pill with the starburst spinning faster and faster and shimmering text: "Thinking...", "Editing your reel...", "Rendering 4K...". On "Done." the star explodes into a screen-wide storm of starbursts with an orange flash, shake and punch-in.
