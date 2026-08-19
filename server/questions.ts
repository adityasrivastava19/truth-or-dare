export interface QuestionItem {
  id: string;
  type: 'truth' | 'dare';
  category: 'classic' | 'party' | 'deep' | 'spicy' | 'couples' | 'icebreaker';
  text: string;
  intensity: 'mild' | 'medium' | 'wild';
}

export const QUESTION_DECK: QuestionItem[] = [
  // --- USER ADDED SPICY & COUPLES DARES (001 - 026) ---
  {
    id: 'dare-001',
    type: 'dare',
    category: 'party',
    text: 'Stand up, turn around slowly, and show the camera your clothed backside for a full five seconds while looking over your shoulder.',
    intensity: 'medium'
  },
  {
    id: 'dare-002',
    type: 'dare',
    category: 'spicy',
    text: 'Walk away from the camera a few steps, then turn and model your outfit from behind like you’re on a runway.',
    intensity: 'medium'
  },
  {
    id: 'dare-003',
    type: 'dare',
    category: 'party',
    text: 'Give the camera a long over-the-shoulder glance while resting one hand on your hip.',
    intensity: 'medium'
  },
  {
    id: 'dare-004',
    type: 'dare',
    category: 'couples',
    text: 'Do a slow, playful runway walk toward the camera, then pivot and walk away, letting everyone see the back view.',
    intensity: 'medium'
  },
  {
    id: 'dare-005',
    type: 'dare',
    category: 'spicy',
    text: 'Lift your shirt just enough to flash a quick glimpse of your stomach, then lower it again with a smirk.',
    intensity: 'medium'
  },
  {
    id: 'dare-006',
    type: 'dare',
    category: 'party',
    text: 'Turn your back to the camera and roll your shoulders slowly while the group rates your posture.',
    intensity: 'medium'
  },
  {
    id: 'dare-007',
    type: 'dare',
    category: 'couples',
    text: 'Remove your outer jacket or sweater on camera and drape it over one shoulder for the rest of the round.',
    intensity: 'medium'
  },
  {
    id: 'dare-008',
    type: 'dare',
    category: 'spicy',
    text: 'Sit sideways and show off one fully clothed leg from ankle to thigh while making slow eye contact.',
    intensity: 'medium'
  },
  {
    id: 'dare-009',
    type: 'dare',
    category: 'party',
    text: 'Stand in profile and let the light create a silhouette of your upper body for ten seconds.',
    intensity: 'medium'
  },
  {
    id: 'dare-010',
    type: 'dare',
    category: 'couples',
    text: 'Lean forward slightly and give the camera a teasing over-the-shoulder look while biting your lip.',
    intensity: 'medium'
  },
  {
    id: 'dare-011',
    type: 'dare',
    category: 'spicy',
    text: 'Turn around, place both hands on your hips, and hold a confident backside pose for eight seconds.',
    intensity: 'medium'
  },
  {
    id: 'dare-012',
    type: 'dare',
    category: 'party',
    text: 'Walk a short runway path away from the camera, pause, and glance back with a flirty expression.',
    intensity: 'medium'
  },
  {
    id: 'dare-013',
    type: 'dare',
    category: 'couples',
    text: 'Slide one sleeve of your top down to show a bare shoulder and leave it there until your next turn.',
    intensity: 'medium'
  },
  {
    id: 'dare-014',
    type: 'dare',
    category: 'spicy',
    text: 'Stand with your back to the camera and slowly run both hands down your sides from ribs to hips.',
    intensity: 'medium'
  },
  {
    id: 'dare-015',
    type: 'dare',
    category: 'party',
    text: 'Choose three non-nude poses; the group votes on which one you have to hold for fifteen seconds.',
    intensity: 'medium'
  },
  {
    id: 'dare-016',
    type: 'dare',
    category: 'couples',
    text: 'Turn around and model the back of your outfit while describing one thing you like about how it fits.',
    intensity: 'medium'
  },
  {
    id: 'dare-017',
    type: 'dare',
    category: 'spicy',
    text: 'Give the camera a lingering over-the-shoulder stare while slowly shifting your weight from one leg to the other.',
    intensity: 'medium'
  },
  {
    id: 'dare-018',
    type: 'dare',
    category: 'party',
    text: 'Remove any outer layer you’re wearing and toss it off-camera with a dramatic flair.',
    intensity: 'medium'
  },
  {
    id: 'dare-019',
    type: 'dare',
    category: 'couples',
    text: 'Stand facing away and arch your back slightly while looking over one shoulder.',
    intensity: 'medium'
  },
  {
    id: 'dare-020',
    type: 'dare',
    category: 'spicy',
    text: 'Show the camera a close-up of your clothed stomach and slowly trace a finger along the waistband.',
    intensity: 'medium'
  },
  {
    id: 'dare-021',
    type: 'dare',
    category: 'party',
    text: 'Do a slow spin so everyone gets a full 360 view of your outfit, pausing at the back.',
    intensity: 'medium'
  },
  {
    id: 'dare-022',
    type: 'dare',
    category: 'couples',
    text: 'Lean against a wall with your back to the camera and glance over your shoulder every few seconds.',
    intensity: 'medium'
  },
  {
    id: 'dare-023',
    type: 'dare',
    category: 'spicy',
    text: 'Raise both arms above your head for ten seconds, showing off your sleeveless or short-sleeved arms.',
    intensity: 'medium'
  },
  {
    id: 'dare-024',
    type: 'dare',
    category: 'party',
    text: 'Walk toward the camera like a model, stop, turn, and walk away with extra sway.',
    intensity: 'medium'
  },
  {
    id: 'dare-025',
    type: 'dare',
    category: 'couples',
    text: 'Sit with your back to the camera and slowly turn your head until your eyes meet the lens.',
    intensity: 'medium'
  },
  {
    id: 'dare-026',
    type: 'dare',
    category: 'spicy',
    text: 'Offer the group three clothed poses; they pick one and you hold it while making steady eye contact.',
    intensity: 'medium'
  },

  // --- ADDITIONAL MEDIUM CLOTHED DARES ---
  {
    id: 'dare-027',
    type: 'dare',
    category: 'party',
    text: 'Turn your back, rest both hands on a nearby surface, and hold the pose so the camera sees your clothed backside clearly.',
    intensity: 'medium'
  },
  {
    id: 'dare-028',
    type: 'dare',
    category: 'spicy',
    text: 'Do a short runway walk away from the camera, then stop and look back over both shoulders in turn.',
    intensity: 'medium'
  },
  {
    id: 'dare-029',
    type: 'dare',
    category: 'couples',
    text: 'Slip off your cardigan or light outer layer and wear it hanging open for the next two rounds.',
    intensity: 'medium'
  },
  {
    id: 'dare-030',
    type: 'dare',
    category: 'party',
    text: 'Stand in soft side-light and slowly turn until your silhouette is fully visible, then hold for eight seconds.',
    intensity: 'medium'
  },
  {
    id: 'dare-031',
    type: 'dare',
    category: 'spicy',
    text: 'Give the camera a slow once-over look while running one hand down the side of your body over your clothes.',
    intensity: 'medium'
  },
  {
    id: 'dare-032',
    type: 'dare',
    category: 'couples',
    text: 'Turn around and let the group decide whether you should pose with hands on hips or arms crossed behind your back.',
    intensity: 'medium'
  },
  {
    id: 'dare-033',
    type: 'dare',
    category: 'party',
    text: 'Walk a few steps, stop, and deliver a confident over-the-shoulder stare that lasts at least five seconds.',
    intensity: 'medium'
  },
  {
    id: 'dare-034',
    type: 'dare',
    category: 'spicy',
    text: 'Show the camera your clothed upper back by turning and gently pulling your hair or collar aside.',
    intensity: 'medium'
  },
  {
    id: 'dare-035',
    type: 'dare',
    category: 'couples',
    text: 'Sit and slowly cross and uncross your legs twice while keeping full eye contact with the camera.',
    intensity: 'medium'
  },
  {
    id: 'dare-036',
    type: 'dare',
    category: 'party',
    text: 'Remove your outermost layer and fold it neatly on camera before setting it aside.',
    intensity: 'medium'
  },
  {
    id: 'dare-037',
    type: 'dare',
    category: 'spicy',
    text: 'Stand with your back to the camera and slowly shift your weight so your clothed backside moves naturally.',
    intensity: 'medium'
  },
  {
    id: 'dare-038',
    type: 'dare',
    category: 'couples',
    text: 'Offer the group a choice between a front three-quarter pose or a full rear pose; hold whichever they pick.',
    intensity: 'medium'
  },
  {
    id: 'dare-039',
    type: 'dare',
    category: 'party',
    text: 'Do a slow half-turn so the camera catches both the side and the back of your outfit.',
    intensity: 'medium'
  },
  {
    id: 'dare-040',
    type: 'dare',
    category: 'spicy',
    text: 'Lean slightly forward with your back partly turned and hold a soft, teasing expression over one shoulder.',
    intensity: 'medium'
  },

  // --- WILD CLOTHED + PROGRESSIVE NUDE DARES ---
  {
    id: 'dare-041',
    type: 'dare',
    category: 'spicy',
    text: 'Turn fully around, plant your feet, and hold a bold clothed-backside pose while looking straight back at the camera for ten seconds.',
    intensity: 'wild'
  },
  {
    id: 'dare-042',
    type: 'dare',
    category: 'couples',
    text: 'Walk away from the camera with deliberate hip movement, pause, and give a long, heated over-the-shoulder look.',
    intensity: 'wild'
  },
  {
    id: 'dare-043',
    type: 'dare',
    category: 'party',
    text: 'Remove your top completely on camera, then turn and model your bare back and shoulders for the group.',
    intensity: 'wild'
  },
  {
    id: 'dare-044',
    type: 'dare',
    category: 'spicy',
    text: 'Stand with your back to the lens, place both hands high on the wall, and hold the arched pose while bare from the waist up for twelve seconds.',
    intensity: 'wild'
  },
  {
    id: 'dare-045',
    type: 'dare',
    category: 'couples',
    text: 'Let another player choose between three poses—one clothed, two involving removing a top or bottoms—and perform the one they select while keeping eye contact.',
    intensity: 'wild'
  },
  {
    id: 'dare-046',
    type: 'dare',
    category: 'party',
    text: 'Do a full playful runway walk toward the camera topless (or bottomless if preferred), stop inches from the lens, turn, and walk away with maximum sway.',
    intensity: 'wild'
  },
  {
    id: 'dare-047',
    type: 'dare',
    category: 'spicy',
    text: 'Remove your top and show a clear view of your bare stomach and chest, then slowly drag both hands from your ribs down past your waist and back up.',
    intensity: 'wild'
  },
  {
    id: 'dare-048',
    type: 'dare',
    category: 'couples',
    text: 'Turn your back fully nude from the waist up and hold a pose that puts your bare backside and back front and center while glancing over your shoulder every three seconds.',
    intensity: 'wild'
  },
  {
    id: 'dare-049',
    type: 'dare',
    category: 'party',
    text: 'Slip your top completely off and leave your upper body bare while you complete a slow spin for the camera.',
    intensity: 'wild'
  },
  {
    id: 'dare-050',
    type: 'dare',
    category: 'spicy',
    text: 'Stand in profile fully topless, raise both arms, and slowly turn until the camera gets a continuous view from front to full bare back silhouette.',
    intensity: 'wild'
  },
  {
    id: 'dare-051',
    type: 'dare',
    category: 'couples',
    text: 'Walk a short runway path away while removing your bottoms, stop, place both hands on your hips, and hold the bare rear pose while counting to fifteen out loud.',
    intensity: 'wild'
  },
  {
    id: 'dare-052',
    type: 'dare',
    category: 'party',
    text: 'Remove your top and bottoms on camera, then use one piece as a prop—drape it, swing it, or wear it loosely while modeling your fully nude body from behind.',
    intensity: 'wild'
  },
  {
    id: 'dare-053',
    type: 'dare',
    category: 'spicy',
    text: 'Give the camera a prolonged over-the-shoulder stare while completely nude, slowly rolling your shoulders and shifting your stance.',
    intensity: 'wild'
  },
  {
    id: 'dare-054',
    type: 'dare',
    category: 'couples',
    text: 'Let the group pick whether you show a fully nude full-back pose, a side nude silhouette, or a front nude focus; hold their choice for twenty seconds.',
    intensity: 'wild'
  },
  {
    id: 'dare-055',
    type: 'dare',
    category: 'party',
    text: 'Turn around fully nude, lean forward slightly at the waist, and hold the pose so the camera gets a clear view of your bare backside and the line of your spine.',
    intensity: 'wild'
  },
  {
    id: 'dare-056',
    type: 'dare',
    category: 'spicy',
    text: 'Walk toward the camera nude, stop, turn your back, and slowly run both hands down the sides of your body from shoulders to thighs.',
    intensity: 'wild'
  },
  {
    id: 'dare-057',
    type: 'dare',
    category: 'couples',
    text: 'Sit fully nude with your back to the camera, then slowly look over each shoulder in turn while adjusting your posture to show more of your bare back.',
    intensity: 'wild'
  },
  {
    id: 'dare-058',
    type: 'dare',
    category: 'party',
    text: 'Offer three bold nude options: full rear nude pose, over-shoulder with arched bare back, or standing nude silhouette; perform the one another player chooses.',
    intensity: 'wild'
  },
  {
    id: 'dare-059',
    type: 'dare',
    category: 'spicy',
    text: 'Strip completely on camera and continue the round fully nude, making sure the camera sees every new angle of your body from behind.',
    intensity: 'wild'
  },
  {
    id: 'dare-060',
    type: 'dare',
    category: 'couples',
    text: 'Do a slow, deliberate runway walk away from the camera fully nude, pause at the far point, and hold a long heated look over one shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-061',
    type: 'dare',
    category: 'party',
    text: 'Stand fully nude facing away, place both hands behind your head, and hold the open pose for twelve seconds while glancing back.',
    intensity: 'wild'
  },
  {
    id: 'dare-062',
    type: 'dare',
    category: 'spicy',
    text: 'Show a clear nude view of your stomach and hips, then slowly turn until your bare backside fills the frame.',
    intensity: 'wild'
  },
  {
    id: 'dare-063',
    type: 'dare',
    category: 'couples',
    text: 'Let another player decide the exact angle—straight nude back, three-quarter nude, or deep over-shoulder nude—and hold that pose while making eye contact.',
    intensity: 'wild'
  },
  {
    id: 'dare-064',
    type: 'dare',
    category: 'party',
    text: 'Walk a full nude runway circuit: approach, turn, walk away, stop, and finish with a bold bare-backside pose held for ten seconds.',
    intensity: 'wild'
  },
  {
    id: 'dare-065',
    type: 'dare',
    category: 'spicy',
    text: 'Turn your back fully nude and slowly move your hips side to side while keeping your upper body still and looking over your shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-066',
    type: 'dare',
    category: 'couples',
    text: 'Strip your remaining clothes in a slow, teasing way, then immediately turn and model your fully nude body from behind with deliberate pauses.',
    intensity: 'wild'
  },
  {
    id: 'dare-067',
    type: 'dare',
    category: 'party',
    text: 'Stand fully nude in low light so only your silhouette is clear, then slowly turn from profile to full bare back while the group watches.',
    intensity: 'wild'
  },
  {
    id: 'dare-068',
    type: 'dare',
    category: 'spicy',
    text: 'Present two nude options—hands-on-hips bare rear pose or arms-crossed-behind bare rear pose—and hold whichever the group votes for while counting to fifteen.',
    intensity: 'wild'
  },
  {
    id: 'dare-069',
    type: 'dare',
    category: 'couples',
    text: 'Give the camera a continuous over-the-shoulder look while fully nude as you slowly walk a small circle that keeps your bare backside in view most of the time.',
    intensity: 'wild'
  },
  {
    id: 'dare-070',
    type: 'dare',
    category: 'party',
    text: 'Strip completely, then drape one removed item across your front like a makeshift wrap and turn so the camera sees both the wrap and your bare body from behind.',
    intensity: 'wild'
  },
  {
    id: 'dare-071',
    type: 'dare',
    category: 'spicy',
    text: 'Lean forward fully nude with your back to the camera, rest your hands on your knees, and hold the pose so your bare backside and the curve of your spine are clearly visible.',
    intensity: 'wild'
  },
  {
    id: 'dare-072',
    type: 'dare',
    category: 'couples',
    text: 'Let another player choose the duration (ten, fifteen, or twenty seconds) and the exact nude rear pose you must hold while maintaining eye contact over your shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-073',
    type: 'dare',
    category: 'party',
    text: 'Do a slow full-body nude turn that lingers on the back view, then stop and slowly run one hand down the center of your bare back.',
    intensity: 'wild'
  },
  {
    id: 'dare-074',
    type: 'dare',
    category: 'spicy',
    text: 'Stand fully nude facing away, rise onto the balls of your feet for a moment, and hold the elongated bare-backside pose while looking back at the camera.',
    intensity: 'wild'
  },
  {
    id: 'dare-075',
    type: 'dare',
    category: 'couples',
    text: 'Walk away fully nude with exaggerated model posture, stop, turn only your head and shoulders, and deliver a long, charged stare over your shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-076',
    type: 'dare',
    category: 'party',
    text: 'Strip to fully nude and continue playing while both shoulders, back, and backside stay completely visible the entire time.',
    intensity: 'wild'
  },
  {
    id: 'dare-077',
    type: 'dare',
    category: 'spicy',
    text: 'Offer the group three escalating fully nude rear poses and perform the boldest one they select while counting slowly to twenty.',
    intensity: 'wild'
  },
  {
    id: 'dare-078',
    type: 'dare',
    category: 'couples',
    text: 'Turn your back fully nude, place both palms flat against a wall or door, and hold the pressed pose so the camera captures your bare backside and outstretched arms.',
    intensity: 'wild'
  },
  {
    id: 'dare-079',
    type: 'dare',
    category: 'party',
    text: 'Do a short nude runway walk that ends with you stopping, turning, and holding a confident hands-on-hips bare-backside pose for the group’s applause or comments.',
    intensity: 'wild'
  },
  {
    id: 'dare-080',
    type: 'dare',
    category: 'spicy',
    text: 'Show a clear nude view of your stomach, then slowly pivot until your bare backside is the main focus, never breaking eye contact over your shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-081',
    type: 'dare',
    category: 'couples',
    text: 'Let another player pick between a standing full-nude rear pose, a slight forward nude lean, or a seated nude back-to-camera pose; hold their choice while speaking one flirty sentence.',
    intensity: 'wild'
  },
  {
    id: 'dare-082',
    type: 'dare',
    category: 'party',
    text: 'Strip completely in full view, then immediately turn and give the camera a long look at your nude back silhouette.',
    intensity: 'wild'
  },
  {
    id: 'dare-083',
    type: 'dare',
    category: 'spicy',
    text: 'Stand fully nude with your back to the lens and slowly move your shoulders and upper back in a subtle rolling motion while glancing over one shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-084',
    type: 'dare',
    category: 'couples',
    text: 'Walk a runway path away fully nude, pause, and hold a deep over-the-shoulder pose that shows both your face and the full line of your bare back.',
    intensity: 'wild'
  },
  {
    id: 'dare-085',
    type: 'dare',
    category: 'party',
    text: 'Present two nude options—full bare rear stance or three-quarter turned nude pose—and hold the one another player selects while slowly shifting your weight.',
    intensity: 'wild'
  },
  {
    id: 'dare-086',
    type: 'dare',
    category: 'spicy',
    text: 'Turn around fully nude, rest both hands high above your head against a surface, and hold the stretched bare-backside pose for fifteen seconds.',
    intensity: 'wild'
  },
  {
    id: 'dare-087',
    type: 'dare',
    category: 'couples',
    text: 'Strip the last of your clothes in a deliberate, unhurried way, then model your fully nude body from behind with a full slow spin and a finishing pose.',
    intensity: 'wild'
  },
  {
    id: 'dare-088',
    type: 'dare',
    category: 'party',
    text: 'Stand fully nude in profile, then continuously turn until you complete a full circle that keeps your bare backside in view for most of the rotation.',
    intensity: 'wild'
  },
  {
    id: 'dare-089',
    type: 'dare',
    category: 'spicy',
    text: 'Let the group vote on whether you hold a straight nude-back pose, a slight nude arch, or a forward nude lean; perform the winner while keeping steady eye contact over your shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-090',
    type: 'dare',
    category: 'couples',
    text: 'Walk away fully nude with slow, intentional steps, stop, and deliver a prolonged heated look over your shoulder while resting one hand on your hip.',
    intensity: 'wild'
  },
  {
    id: 'dare-091',
    type: 'dare',
    category: 'party',
    text: 'Turn your back fully nude and slowly slide both hands from your shoulders down the sides of your torso to your hips.',
    intensity: 'wild'
  },
  {
    id: 'dare-092',
    type: 'dare',
    category: 'spicy',
    text: 'Offer three fully nude rear-focused poses of increasing boldness; the group picks one and you hold it for a full twenty seconds while counting aloud.',
    intensity: 'wild'
  },
  {
    id: 'dare-093',
    type: 'dare',
    category: 'couples',
    text: 'Strip completely and immediately turn so the camera gets an uninterrupted view of your nude backside in every detail.',
    intensity: 'wild'
  },
  {
    id: 'dare-094',
    type: 'dare',
    category: 'party',
    text: 'Do a complete nude runway sequence that ends with you facing away, hands on hips, holding the pose while the group rates the bare back view from one to ten.',
    intensity: 'wild'
  },
  {
    id: 'dare-095',
    type: 'dare',
    category: 'spicy',
    text: 'Stand fully nude facing away, rise slightly onto your toes, and hold the elongated pose while looking back over your shoulder with a teasing expression.',
    intensity: 'wild'
  },
  {
    id: 'dare-096',
    type: 'dare',
    category: 'couples',
    text: 'Let another player choose the exact nude rear angle and whether you keep your hands on your hips, behind your back, or above your head; hold it while making eye contact.',
    intensity: 'wild'
  },
  {
    id: 'dare-097',
    type: 'dare',
    category: 'party',
    text: 'Walk a slow path away fully nude, pause at the farthest point, and hold a bold over-the-shoulder stare for as long as the group demands (minimum ten seconds).',
    intensity: 'wild'
  },
  {
    id: 'dare-098',
    type: 'dare',
    category: 'spicy',
    text: 'Turn fully around nude, lean just enough to emphasize the line of your back, and hold the bare-backside pose while slowly rolling one shoulder.',
    intensity: 'wild'
  },
  {
    id: 'dare-099',
    type: 'dare',
    category: 'couples',
    text: 'Strip the final layer in a deliberate, unhurried way, then immediately model the full nude back view with a complete slow spin and a finishing pose.',
    intensity: 'wild'
  },
  {
    id: 'dare-100',
    type: 'dare',
    category: 'party',
    text: 'Present the group with three final fully nude options—classic bare rear stance, arched over-shoulder nude, or wall-lean bare backside—and perform the one they choose while holding eye contact until they say stop.',
    intensity: 'wild'
  },

  // --- 1-ON-1 ROMANTIC & COUPLES TRUTHS ---
  { id: 'c1', type: 'truth', category: 'couples', text: 'What is the sweetest or most romantic thing someone could say to you right now?', intensity: 'mild' },
  { id: 'c2', type: 'truth', category: 'couples', text: 'What was your honest first reaction when you saw me on camera today?', intensity: 'medium' },
  { id: 'c3', type: 'truth', category: 'couples', text: 'What is a cute nickname you would love to give me?', intensity: 'mild' },
  { id: 'c4', type: 'truth', category: 'couples', text: 'If we could jet off on a weekend getaway together right now, where would we go?', intensity: 'medium' },
  { id: 'c5', type: 'truth', category: 'couples', text: 'What is your idea of a perfect romantic evening with someone special?', intensity: 'medium' },
  { id: 'c6', type: 'truth', category: 'couples', text: 'What is a flirty secret or thought you had about me during this call?', intensity: 'wild' },
  { id: 'c7', type: 'truth', category: 'couples', text: 'What is one thing I do that always makes you smile or feel closer to me?', intensity: 'mild' },
  { id: 'c8', type: 'truth', category: 'couples', text: 'Describe the most intimate non-physical moment you’ve ever shared with someone.', intensity: 'medium' },
  { id: 'c9', type: 'truth', category: 'couples', text: 'What would you do if we were alone in the same room right now?', intensity: 'wild' },
  { id: 'c10', type: 'truth', category: 'couples', text: 'What is your biggest turn-on when it comes to video calls or long-distance flirting?', intensity: 'wild' },

  // --- SPICY & FLIRTY TRUTHS & DARES ---
  { id: 'rt1', type: 'truth', category: 'spicy', text: 'What was the first thing you noticed about me when we turned on our cameras?', intensity: 'mild' },
  { id: 'rt2', type: 'truth', category: 'spicy', text: 'What is your favorite feature or romantic attribute about me?', intensity: 'medium' },
  { id: 'rt3', type: 'truth', category: 'spicy', text: 'Have you ever fantasized about someone on a video call? What happened?', intensity: 'wild' },
  { id: 'rt4', type: 'truth', category: 'spicy', text: 'What is the boldest thing you would be willing to do on camera right now if dared?', intensity: 'wild' },
  { id: 'rt5', type: 'truth', category: 'spicy', text: 'What part of your body do you feel most confident showing, and why?', intensity: 'medium' },
  { id: 'rd1', type: 'dare', category: 'spicy', text: 'Look straight into the camera for 20 seconds without blinking and give me your most sensual smile.', intensity: 'medium' },
  { id: 'rd2', type: 'dare', category: 'spicy', text: 'Whisper your smoothest, most seductive pick-up line into the microphone.', intensity: 'medium' },
  { id: 'rd3', type: 'dare', category: 'spicy', text: 'Describe in detail what you would do if we were in the same room and both feeling playful.', intensity: 'wild' },
  { id: 'rd4', type: 'dare', category: 'spicy', text: 'Remove one more layer of clothing right now and hold eye contact the entire time.', intensity: 'wild' },
  { id: 'rd5', type: 'dare', category: 'spicy', text: 'Turn around fully nude (or as close as you are willing) and give the camera a slow, deliberate once-over from behind.', intensity: 'wild' },

  // --- EXTRA ICEBREAKER & CLASSIC TRUTHS ---
  { id: 'i1', type: 'truth', category: 'icebreaker', text: 'What is the most spontaneous thing you have done in the last month?', intensity: 'mild' },
  { id: 'i2', type: 'truth', category: 'icebreaker', text: 'If you could switch lives with anyone on this call for a day, who would it be and why?', intensity: 'mild' },
  { id: 'cl1', type: 'truth', category: 'classic', text: 'What is a secret talent you have that almost no one knows about?', intensity: 'mild' },
  { id: 'cl2', type: 'truth', category: 'classic', text: 'What is the most embarrassing thing that has ever happened to you on a video call?', intensity: 'medium' },
  { id: 'd1', type: 'truth', category: 'deep', text: 'What is something you are currently working on improving about yourself?', intensity: 'medium' },
  { id: 'd2', type: 'truth', category: 'deep', text: 'When do you feel most alive or most like yourself?', intensity: 'medium' }
];

export function getRandomQuestion(
  type: 'truth' | 'dare',
  category: string,
  usedIds: string[] = []
): QuestionItem {
  let filtered = QUESTION_DECK.filter((q) => {
    if (q.type !== type) return false;
    if (category === 'all') return true;
    if (category === 'spicy' || category === 'couples') {
      return q.category === 'spicy' || q.category === 'couples' || q.category === 'party';
    }
    return q.category === category;
  });

  const unused = filtered.filter((q) => !usedIds.includes(q.id));
  if (unused.length > 0) {
    filtered = unused;
  }

  if (filtered.length === 0) {
    filtered = QUESTION_DECK.filter((q) => q.type === type);
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}