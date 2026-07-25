import type { Phase } from '../types'

/** Coaching phases for the passing manual. */
export const PASSING_PHASES: Record<string, Phase[]> = {
  'pas-a1': [
    {
      t0: 0,
      t1: 1.9,
      title: 'Scan before it arrives',
      text: 'Minimum two head turns while the ball is travelling. Scanning after receiving means the information arrives too late.',
      focus: ['a', 'b', 'e'],
      cues: {
        a: 'Firm along the ground into his back foot, then follow your pass.',
        b: 'Two head turns now, before it gets to you.',
        e: 'Colour goes up while the ball is in flight — the picture changes mid-pass.',
        c: 'Communicate early so he knows you are available.',
      },
    },
    {
      t0: 1.9,
      t1: 3.5,
      title: 'Open out on the half turn',
      text: 'First touch out of the feet at an angle, never straight ahead. Two touches maximum: one to open, one to pass.',
      focus: ['b'],
      cues: {
        b: 'Back foot, first touch at an angle away from pressure.',
        c: 'Trigger says this side — show for it.',
        d: 'Not this time. Reset for the next repetition.',
      },
    },
    {
      t0: 3.5,
      t1: 7,
      title: 'One-touch return',
      text: 'The arm of the Y that receives returns it first time to the next player entering the base.',
      focus: ['c', 'a'],
      cues: {
        c: 'One touch back to the next man in.',
        a: 'You followed your pass — you are the middle player now.',
      },
    },
  ],

  'pas-a2': [
    {
      t0: 0,
      t1: 3.4,
      title: 'Find the free goal',
      text: 'Scan for which goal is unguarded before receiving. The support angle is what makes the pass exist.',
      focus: ['t1a', 't1b', 't2a'],
      cues: {
        t1a: 'Two touches. Look for the unguarded goal before it reaches you.',
        t1b: 'Position on the far side of a goal, not next to the ball.',
        t1c: 'Show beyond the goal so the pass through it is on.',
        t2a: 'Press the ball and guard your nearest goal.',
      },
    },
    {
      t0: 3.4,
      t1: 5.6,
      title: 'Switch rather than force',
      text: 'Forcing the pass through a guarded goal is the standard error. The nearest teammate always offers a backward option.',
      focus: ['t1c', 't1d'],
      cues: {
        t1c: 'Guarded — switch it instead of forcing it.',
        t1d: 'Backward option so the point of attack can change.',
        t2b: 'Shift across with the ball.',
      },
    },
    {
      t0: 5.6,
      t1: 8,
      title: 'Score through a different goal',
      text: 'After scoring through one goal the team must use a different one next, which forces the space to be found rather than a pattern repeated.',
      focus: ['t1d'],
      cues: {
        t1d: 'Firm and along the ground through the gate to a teammate.',
        t2a: 'Too late — the space was found before you shifted.',
      },
    },
  ],

  'pas-a3': [
    {
      t0: 0,
      t1: 2.5,
      title: '10m — inside of the foot',
      text: 'Non-kicking foot pointed at the target, ankle locked, follow through low and toward the target.',
      focus: ['ps', 'r1'],
      cues: {
        ps: 'Inside of the foot, along the ground, firm.',
        r1: 'Call for it and indicate which foot. Cushion away from the imaginary defender.',
      },
    },
    {
      t0: 2.5,
      t1: 5.6,
      title: '25m — driven',
      text: 'Struck through the middle of the ball slightly above centre with the laces, kept below head height. Body over the ball — leaning back lifts it.',
      focus: ['ps', 'r2'],
      cues: {
        ps: 'Laces, flat, body over the ball.',
        r2: 'Receive on the move so the pass has to lead you.',
      },
    },
    {
      t0: 5.6,
      t1: 10,
      title: '45m — lofted into space',
      text: 'Struck beneath the centre with a 30 to 45 degree approach, landing into the space ahead of the receiver rather than at their feet.',
      focus: ['ps', 'r3'],
      cues: {
        ps: 'Beneath the ball, land it into the space ahead of his run.',
        r3: 'Running onto it — the passer must judge timing as well as distance.',
      },
    },
  ],

  'pas-b1': [
    {
      t0: 0,
      t1: 2.4,
      title: 'Neutrals hold the far edge',
      text: 'Neutrals stand on the far edge of their zone with an open body. Standing close to the ball shortens the angle and lets one defender cover two.',
      focus: ['n1', 'p1', 'd1'],
      cues: {
        n1: 'Far edge of your zone, body open across the pitch.',
        p1: 'Find who is free before receiving, not while holding it.',
        d1: 'Press with a clear leader. The rest cover the lanes.',
        p4: 'Wait in the top zone — that is where the point is scored.',
      },
    },
    {
      t0: 2.4,
      t1: 5.4,
      title: 'Circulate to find the free man',
      text: 'The free man is created by the neutral overload. A player facing sideways cannot break a line.',
      focus: ['n2', 'p2', 'p3'],
      cues: {
        n2: 'One or two touches, never with your back to the zone ahead.',
        p2: 'Body orientation decides whether you circulate or progress.',
        d2: 'Force them backwards.',
      },
    },
    {
      t0: 5.4,
      t1: 9,
      title: 'Break the line',
      text: 'A pass from the bottom zone to the top scores one; skipping the middle zone entirely scores three.',
      focus: ['n3', 'p4', 'p2'],
      cues: {
        n3: 'Top zone. Set it into the man arriving.',
        p4: 'Control facing forward — that is what makes the point count.',
        d4: 'Late to the line-breaking pass.',
      },
    },
  ],

  'pas-b2': [
    {
      t0: 0,
      t1: 4,
      title: 'Split and wait for the press',
      text: 'A pass played before the presser moves does not break anything. Split wide to create the widest possible angle.',
      focus: ['cb1', 'cb2', 'gk', 'pr1'],
      cues: {
        cb1: 'Split wide. Wait for him to commit before you release.',
        gk: 'Circulate through me — but three backward passes in a row loses a point.',
        m1: 'Position in the gap between pressers, never in a cover shadow.',
        pr1: 'Press the ball, cut the line to the midfielder.',
      },
    },
    {
      t0: 4,
      t1: 6,
      title: 'Break the first line',
      text: 'The first pass forward goes to the back foot of the midfielder, and it must be firm.',
      focus: ['cb2', 'm1', 'pr3'],
      cues: {
        cb2: 'Firm, into his back foot.',
        m1: 'Half turn, check your shoulder before it arrives.',
        m2: 'Sit behind the ball and offer the safe pass back.',
        pr3: 'Screen the entry into midfield.',
      },
    },
    {
      t0: 6,
      t1: 8.9,
      title: 'Into zone 3',
      text: 'First option is the pass into zone 3, second the switch, third back to zone 1 — in that order.',
      focus: ['m1', 'f1', 'f2'],
      cues: {
        m1: 'Zone 3 first. Do not default sideways.',
        f1: 'Drop between the lines and lay off to the runner.',
        f2: 'Spin in behind. Vary it so the defender cannot anticipate.',
      },
    },
    {
      t0: 8.9,
      t1: 11,
      title: 'Control facing forward',
      text: 'The point only scores when the receiver in zone 3 controls it facing forward. Count line-breaking passes, not total passes.',
      focus: ['f2', 'pr5'],
      cues: {
        f2: 'Facing forward on the first touch.',
        pr5: 'Beaten by the spin.',
      },
    },
  ],

  'pas-b3': [
    {
      t0: 0,
      t1: 3.4,
      title: 'Overload to shift them',
      text: 'Crowd one flank with three or four and circulate quickly. The trigger for the switch is the defence having more than half its players on one side.',
      focus: ['o1', 'o2', 'o3', 'd1'],
      cues: {
        o1: 'Two touches. Pull them across.',
        o2: 'Occupy a defender — you do not need to receive.',
        sw: 'Get your body facing across the pitch before it comes to you.',
        fr: 'Stay wide and still. Movement attracts a marker.',
        d1: 'Shifting toward the ball, which is correct — and is the trap.',
      },
    },
    {
      t0: 3.4,
      t1: 5.8,
      title: 'One-pass switch',
      text: 'Switching too early, before the defence has shifted, is the standard error. Aim into the space ahead of the far receiver.',
      focus: ['sw', 'fr', 'sr'],
      cues: {
        sw: 'Now — one pass, not a relay.',
        sr: 'Sprint across as the ball travels or the switch just makes a 1v1.',
        fr: 'First touch forward into the space.',
      },
    },
    {
      t0: 5.8,
      t1: 10,
      title: 'Penetrate within 6 seconds',
      text: 'A goal only counts within six seconds of the switch, and two switches without penetration loses a point.',
      focus: ['fr', 'sr', 'd4'],
      cues: {
        fr: 'Attack the nearest goal. If a defender arrives, use the half-space goal.',
        sr: 'Arriving to support — this is what turns the switch into an overload.',
        d4: 'Recovering too late across the pitch.',
      },
    },
  ],

  'pas-c1': [
    {
      t0: 0,
      t1: 2.6,
      title: 'Look forward first',
      text: 'Most players look sideways by default because it is safer. This is a habit drill as much as a technical one.',
      focus: ['a1', 'a2'],
      cues: {
        a1: 'Forward first. Three seconds on the ball, maximum.',
        a2: 'Position beyond a gate, not beside it. You must be findable.',
        a3: 'Make your run before he looks up, not after.',
        b1: 'Press and block the forward gates.',
      },
    },
    {
      t0: 2.6,
      t1: 6.4,
      title: 'Through the gates',
      text: 'One point per completed pass forward through a gate. Passing through sideways does not count.',
      focus: ['a2', 'a3', 'a4'],
      cues: {
        a2: 'Through the gate, not around it.',
        a3: 'Received beyond the gate — now find the next one.',
        a4: 'Show beyond the next gate.',
        b2: 'Cover the gate, force him sideways.',
      },
    },
    {
      t0: 6.4,
      t1: 9,
      title: 'Reward the attempt',
      text: 'Reward the attempted forward pass even when it fails, at least in early blocks. A team that never risks the forward pass cannot counter.',
      focus: ['a4', 'a5'],
      cues: {
        a4: 'Play it forward even if it is the harder ball.',
        a5: 'Furthest gate. Keep showing.',
      },
    },
  ],

  'pas-c2': [
    {
      t0: 0,
      t1: 1.8,
      title: 'First pass forward',
      text: 'Enforced strictly: the first pass after the turnover must go forward. Freeze the drill on every sideways first pass.',
      focus: ['fr', 'ff'],
      cues: {
        fr: 'Scan while it travels. One touch to control forward, second to pass.',
        ff: 'Sprint immediately, whether or not you expect it. Call "behind" or "feet".',
        lw: 'Forward and outward at once. Do not check back.',
        rw: 'Run as hard as the ball-side winger.',
      },
    },
    {
      t0: 1.8,
      t1: 4.4,
      title: 'Driven, into space',
      text: 'Passing weight in transition is different: harder, flatter, into space rather than to feet.',
      focus: ['ff', 'lw', 'tm'],
      cues: {
        ff: 'Never take it backwards.',
        lw: 'Wide and running — the pitch stays long.',
        tm: 'Stay 10 to 15m behind the ball. You are the outlet and the cutback.',
      },
    },
    {
      t0: 4.4,
      t1: 8,
      title: 'Shoot inside 6 seconds',
      text: 'Maximum four passes before the shot. Measure time from turnover to the ball entering the final third.',
      focus: ['rw', 'gk'],
      cues: {
        rw: 'Far post arrival, finish into the open side.',
        gk: 'Cannot cover both posts against a counter this wide.',
      },
    },
  ],

  'pas-c3': [
    {
      t0: 0,
      t1: 2.3,
      title: 'The free man is deepest',
      text: 'The deepest player positions centrally and offers the switch, angled across — never receiving with his back to the press.',
      focus: ['deep', 'x1'],
      cues: {
        deep: 'Central, body angled across. Never back to the press.',
        p2: 'Show only when you can receive facing forward or play one touch.',
        x1: 'Close the ball, block the lane, force the error.',
        t1: 'Come short. One of us short, one long.',
      },
    },
    {
      t0: 2.3,
      t1: 6.4,
      title: 'Play out of the tight area',
      text: 'Two touches maximum, one touch when a presser is within 2m. Under pressure the pass must be firm — soft passes are intercepted.',
      focus: ['p2', 'p3', 'p4', 'x2'],
      cues: {
        p3: 'Do not show into a cover shadow.',
        p4: 'One touch — he is inside 2m.',
        x3: 'Squeeze the space, force it backwards.',
      },
    },
    {
      t0: 6.4,
      t1: 9,
      title: 'Through it, or over it',
      text: 'Through the press scores two, over it scores one. Playing over is not failure — it is the correct answer when the press is well organised.',
      focus: ['t1', 't2', 'p4'],
      cues: {
        t1: 'Short option — lay it into the long man.',
        t2: 'Stay long so both routes exist.',
        x4: 'Beaten by the combination through the press.',
      },
    },
  ],

  'pas-d1': [
    {
      t0: 0,
      t1: 2.7,
      title: 'Shift them centrally',
      text: 'Circulate quickly, two touches maximum. The trigger is the far channel being genuinely 1v1 with the defender tight to the touchline.',
      focus: ['c1', 'c2', 'd1'],
      cues: {
        c1: 'Two touches. Move them before you switch.',
        c2: 'Check the far-side defender before switching — isolation must be real.',
        lw: 'Touchline, high and still.',
        d1: 'Shifting across with the ball.',
      },
    },
    {
      t0: 2.7,
      t1: 5.4,
      title: 'Switch to the isolated winger',
      text: 'A pass to a player on the touchline is harder because the pitch ends behind him — play it slightly infield of his body so he can control forward.',
      focus: ['c2', 'lw', 'd2'],
      cues: {
        c2: 'Slightly infield of his body. To his feet on the line traps him.',
        lw: 'Back foot, first touch forward down the line.',
        lb: 'You may enter the channel only now that he has received.',
        d2: 'One-v-one against the touchline.',
      },
    },
    {
      t0: 5.4,
      t1: 7.7,
      title: 'Beat him to the byline',
      text: 'Options in order: reach the byline, cut it back early, or pass inside to the arriving midfielder.',
      focus: ['lw', 'lb', 'np', 'ps', 'bp'],
      cues: {
        lw: 'Byline first, cutback second.',
        np: 'Near post — start moving now.',
        ps: 'Penalty spot, delayed.',
        bp: 'Back post, diagonal inward.',
      },
    },
    {
      t0: 7.7,
      t1: 10,
      title: 'Three into the box',
      text: 'Three players must enter the box on every wide entry: near post, penalty spot, back post.',
      focus: ['np', 'ps', 'bp', 'gk'],
      cues: {
        ps: 'Finish into the open side.',
        np: 'Near post, in front of the defender.',
        gk: 'Committed to the near post.',
      },
    },
  ],

  'pas-d2': [
    {
      t0: 0,
      t1: 2.5,
      title: 'Read the defender',
      text: 'If he shows you outside the underlap is on; if he presses tight inside the overlap is on. Your body shape must disguise the choice.',
      focus: ['rw', 'd1', 'rb'],
      cues: {
        rw: 'Same approach every time, different outcome. Disguise it.',
        rb: 'One run per repetition, committed fully. Call it before it starts.',
        cm: 'Top of the triangle, facing the touchline so you see both.',
        d1: 'Show him one way and stick to it.',
      },
    },
    {
      t0: 2.5,
      t1: 4.7,
      title: 'Third-man combination',
      text: 'Winger inside to the midfielder, midfielder first time into the overlapping run — and the fullback’s run starts before the midfielder receives.',
      focus: ['rw', 'cm', 'rb'],
      cues: {
        rw: 'Inside to the midfielder.',
        cm: 'One touch into his run. Ahead of him, not at his feet.',
        rb: 'Already running — that is what makes the third man work.',
      },
    },
    {
      t0: 4.7,
      t1: 9,
      title: 'Deliver inside 6 seconds',
      text: 'A pass the defender saw coming has failed even if it was completed. Freeze the drill and ask why that combination was chosen.',
      focus: ['rb', 'st', 'gk'],
      cues: {
        rb: 'Along the ground, ahead of the run, no broken stride.',
        st: 'Arriving for the cutback.',
        gk: 'Dragged to the near post.',
      },
    },
  ],

  'pas-d3': [
    {
      t0: 0,
      t1: 3.1,
      title: 'Driven diagonal',
      text: 'Play it so the wide player arrives facing goal — aim slightly ahead of him.',
      focus: ['dp', 'rw'],
      cues: {
        dp: 'Driven, slightly ahead so he receives facing goal.',
        rw: 'Arriving onto it, already square to the box.',
        np: 'Start moving before he receives — that is what makes the early cross viable.',
        bp: 'Wide to inside, from behind the line.',
      },
    },
    {
      t0: 3.1,
      t1: 5,
      title: 'Scan the box, then decide',
      text: 'The rule is simple: cross early when runners are ahead of the ball, carry to the byline when they are not.',
      focus: ['rw', 'np', 'bp', 'ps'],
      cues: {
        rw: 'Two runners already moving — cross early.',
        ps: 'Third runner, arriving half a second later.',
        d3: 'Closing him down, forcing the early decision.',
      },
    },
    {
      t0: 5,
      t1: 8,
      title: 'Into the gap',
      text: 'Driven with the laces into the space between the goalkeeper and the defensive line, roughly 10m from goal.',
      focus: ['ps', 'np', 'gk'],
      cues: {
        ps: 'Between the keeper and the line — he cannot commit.',
        np: 'Attack the front of the defender.',
        gk: 'Caught between coming and staying.',
      },
    },
  ],

  'pas-e1': [
    {
      t0: 0,
      t1: 1.8,
      title: 'Two seconds to strike',
      text: 'A presser closes you down two seconds after you receive. Choose the target inside that window.',
      focus: ['ps', 'x1', 'rn'],
      cues: {
        ps: 'Two seconds. Pick the in-behind ball or the feet ball.',
        rn: 'Start only when his head comes up. Starting early kills the option.',
        tg: 'Establish contact with your marker before it arrives.',
        x1: 'Close him inside two seconds.',
      },
    },
    {
      t0: 1.8,
      t1: 5.6,
      title: 'The in-behind ball',
      text: 'Lofted, landing in the space, weighted so the receiver runs onto it without breaking stride. Leaning back sends it high and slow.',
      focus: ['rn', 'x2'],
      cues: {
        rn: 'Curve the run to stay onside and arrive facing goal.',
        ps: 'Beneath the centre of the ball, into the space.',
        x2: 'Recovering — the pass has to be precise to beat you.',
      },
    },
    {
      t0: 5.6,
      t1: 9,
      title: 'The feet ball',
      text: 'Driven, flat, to the chest or feet, firm enough to arrive before the marker can react. The technique changes entirely between the two.',
      focus: ['tg', 'ps', 'x3'],
      cues: {
        ps: 'Flat and firm this time. Different pass, different technique.',
        tg: 'Show a big target: chest, or a foot planted wide.',
        x3: 'Contesting from behind.',
      },
    },
  ],

  'pas-e2': [
    {
      t0: 0,
      t1: 2.5,
      title: 'Attack the aerial duel',
      text: 'A jump from a run beats a jump from standing. Head or chest it into a planned area — nominate the direction before the serve.',
      focus: ['sv', 'a1', 'b1'],
      cues: {
        sv: 'Vary it: flat and driven, high and hanging, near or far shoulder.',
        a1: 'Attack it, do not wait for it. Nominate where you are putting it.',
        a2: 'Triangle: one behind, one either side. Move as it travels.',
        b1: 'Contest it properly.',
      },
    },
    {
      t0: 2.5,
      t1: 5,
      title: 'Win the second ball',
      text: 'Second balls are won by positioning and anticipation more than athleticism. Do not stand still — arrive with momentum.',
      focus: ['a2', 'a3', 'b2'],
      cues: {
        a2: 'Arriving with momentum, not standing waiting.',
        a3: 'Side of the triangle. Ready to go forward.',
        b2: 'Beaten to the drop.',
      },
    },
    {
      t0: 5,
      t1: 8,
      title: 'Forward, never square',
      text: 'The pass after winning a second ball is one of the highest value in direct play, because the opposition is unbalanced. Never square across your own defence.',
      focus: ['a3', 'a4'],
      cues: {
        a3: 'One touch, forward or wide. Not back into the congestion.',
        a4: 'Outlet in space — relieve the pressure.',
      },
    },
  ],

  'pas-e3': [
    {
      t0: 0,
      t1: 2,
      title: 'The trigger to go direct',
      text: 'Build short or go direct — the choice is yours, but the trigger is defined: if the target has separation from his marker, go direct.',
      focus: ['dp', 'tp', 'd1'],
      cues: {
        dp: 'He has separation — go direct. Firm, into his body or feet.',
        tp: 'Raised arm and a call so he knows the option is on.',
        r1: 'Start your run as the pass is struck, not when he receives.',
        d1: 'Get in front of him if you can.',
      },
    },
    {
      t0: 2,
      t1: 4.3,
      title: 'Set',
      text: 'Lay off first time into the path of the runner. If you turn, the drill has lost its purpose.',
      focus: ['tp', 'r1', 'r2'],
      cues: {
        tp: 'First time into his path. Never turn.',
        r1: 'Past his shoulder.',
        r2: 'Into the space beyond.',
      },
    },
    {
      t0: 4.3,
      t1: 8,
      title: 'And go',
      text: 'Reward the sequence: direct pass, one-touch lay-off, forward pass. Three passes to reach the final third is a successful direct attack.',
      focus: ['r1', 'r2'],
      cues: {
        r1: 'Forward first touch, then release.',
        r2: 'Arriving beyond the line to finish.',
      },
    },
  ],

  'pas-f1': [
    {
      t0: 0,
      t1: 2.9,
      title: 'Verbalise the responsibility',
      text: 'Each position states its passing responsibility before receiving — "I switch", "I play forward", "I set back". It forces the mental model.',
      focus: ['cb1', 'dm'],
      cues: {
        cb1: 'Split, pass forward or switch. Never square across the middle.',
        dm: 'Receive on the half turn, always face across.',
        rb: 'Receive facing forward — down the line or inside to the half-space.',
      },
    },
    {
      t0: 2.9,
      t1: 6.6,
      title: 'Round the shape',
      text: 'Two touches maximum throughout. The pattern replicates your own build-up shape.',
      focus: ['rb', 'rw', 'if'],
      cues: {
        rw: 'Receive on the touchline, pass inside or set back.',
        if: 'Half turn, then play forward or combine.',
        rb: 'Down the line, weighted for his outside foot.',
      },
    },
    {
      t0: 6.6,
      t1: 10,
      title: 'Rotate one position',
      text: 'After every completed pattern every player rotates one position clockwise. Players who only ever play one position develop one passing habit.',
      focus: ['st', 'lw'],
      cues: {
        st: 'Back to goal — set back or spin. Nothing else.',
        lw: 'Far side finishes the pattern, then everyone moves round.',
      },
    },
  ],

  'pas-f2': [
    {
      t0: 0,
      t1: 2.5,
      title: 'Pass to the zone, not the name',
      text: 'The player in the space is the option, whoever they are. Scan for the rotation before receiving — the picture changes every two seconds.',
      focus: ['r1', 'r2', 'x1'],
      cues: {
        r1: 'Ball carrier stays. Everyone else rotates.',
        r2: 'Call loudly as you enter a new zone.',
        r6: 'Enter facing the ball with an open body.',
        x1: 'Chase the rotation — that is what it is designed to break.',
      },
    },
    {
      t0: 2.5,
      t1: 6.1,
      title: 'If a teammate enters, you leave',
      text: 'Two players entering the same zone is the standard failure of rotation systems. No more than two from the same team per zone.',
      focus: ['r3', 'r4', 'r5'],
      cues: {
        r3: 'He has come into your zone — go.',
        r4: 'Take the zone he vacated.',
        r5: 'Balance the far side.',
      },
    },
    {
      t0: 6.1,
      t1: 10,
      title: 'Trust the space',
      text: 'The core skill is passing to a space and trusting a teammate has filled it. Do not run this drill in silence.',
      focus: ['r6', 'r1'],
      cues: {
        r6: 'Just rotated in — this is the pass that scores.',
        r1: 'Pass where he will be, not where he was.',
      },
    },
  ],

  'pas-f3': [
    {
      t0: 0,
      t1: 2.7,
      title: 'Move his eyes',
      text: 'The decoy makes an obvious run the other way and demands the ball loudly. His job is to move the defender’s eyes.',
      focus: ['dc', 'ps', 'd2'],
      cues: {
        dc: 'Obvious run the other way. Shout for it.',
        ps: 'Look at one option, pass to another.',
        bs: 'Delay. Early runners are seen.',
        d2: 'Head turning toward the ball — that is the moment he moves.',
      },
    },
    {
      t0: 2.7,
      t1: 4.2,
      title: 'The blind side run',
      text: 'Start from outside the defender’s field of vision, behind his shoulder, and run diagonally across his path so he must turn his whole body.',
      focus: ['bs', 'ps', 'd1'],
      cues: {
        bs: 'Diagonal across his path, from behind the shoulder.',
        ps: 'Weight it so he meets it in stride, ahead of the recovery.',
        d1: 'Cannot watch the ball and the runner at once.',
      },
    },
    {
      t0: 4.2,
      t1: 8,
      title: 'In stride',
      text: 'The passer’s disguise and the runner’s timing have to be coordinated. Practise them as a pair before adding the full group.',
      focus: ['bs', 'gk'],
      cues: {
        bs: 'Meeting it in stride, finish into the open side.',
        gk: 'Beaten by the late run.',
      },
    },
  ],

  'pas-g1': [
    {
      t0: 0,
      t1: 3,
      title: 'Scan under load',
      text: 'Normal two-touch possession, but at random moments the coach calls a name and that player must call the current board.',
      focus: ['coach', 'a1', 'a2'],
      cues: {
        coach: 'Boards change every few seconds — the picture never holds still.',
        a1: 'Two touches. Keep scanning.',
        a2: 'Over the far shoulder is the valuable scan — the ball side you can already see.',
      },
    },
    {
      t0: 3,
      t1: 6,
      title: 'Four to six scans',
      text: 'Target roughly four to six scans in the ten seconds before receiving. Players who scan more make faster and better decisions.',
      focus: ['a3', 'a4', 'b1'],
      cues: {
        a3: 'Scan, receive, play. In that order.',
        a4: 'Head up before it arrives.',
        b1: 'Press to make the scanning harder.',
      },
    },
    {
      t0: 6,
      t1: 9,
      title: 'Make the habit conscious',
      text: 'Correct answer scores for their team, incorrect scores for the opposition. The drill makes the habit conscious before it becomes automatic.',
      focus: ['a5'],
      cues: {
        a5: 'Called out — what colour is the board?',
        b3: 'Keep the pressure on while he answers.',
      },
    },
  ],

  'pas-g2': [
    {
      t0: 0,
      t1: 3.1,
      title: 'Scan freely — before the touch',
      text: 'Players may scan as much as they like before receiving, but from the first touch until the pass their eyes stay on the ball.',
      focus: ['a1', 'a2'],
      cues: {
        a1: 'Look now. After your first touch you cannot.',
        a2: 'Build the map before it arrives.',
        b1: 'Press and make the map go stale.',
      },
    },
    {
      t0: 3.1,
      t1: 6,
      title: 'No final look',
      text: 'This is uncomfortable and error rates rise. That is intended — the learning happens in the discomfort.',
      focus: ['a3', 'a4', 'a5'],
      cues: {
        a3: 'No final glance. Play what you already know.',
        a4: 'One touch is exempt from the restriction.',
        b2: 'Punish the pass played on old information.',
      },
    },
    {
      t0: 6,
      t1: 8,
      title: 'Then remove it',
      text: 'Remove the restriction afterwards and observe whether the increased scanning persists.',
      focus: ['a6'],
      cues: {
        a6: 'You scanned more. That is the point.',
      },
    },
  ],

  'pas-g3': [
    {
      t0: 0,
      t1: 4,
      title: 'Block 1 — every possession switches',
      text: 'Constraints force players out of habitual solutions. The learning is in the adaptation, not the constraint itself.',
      focus: ['a1', 'a2'],
      cues: {
        a1: 'This possession has to include a switch.',
        a2: 'Face across the pitch so the switch is available.',
        b1: 'Shift with the ball and make them work for it.',
      },
    },
    {
      t0: 4,
      t1: 7.4,
      title: 'Block 2 — two touches',
      text: 'The constraint changes every three minutes without warning, so players must recognise the new rule rather than settle into it.',
      focus: ['a3', 'a4'],
      cues: {
        a3: 'Two touches. Decide before it arrives.',
        a4: 'Support angle so two touches is enough.',
        b2: 'Press the second touch.',
      },
    },
    {
      t0: 7.4,
      t1: 12,
      title: 'Block 3 — first-time assist',
      text: 'A goal only counts if the assist was first time. Block 5 is free play, and the real test is whether these behaviours persist without the rule.',
      focus: ['a4', 'a5', 'gk'],
      cues: {
        a4: 'First time into his run, or the goal does not count.',
        a5: 'Finish into the open side.',
        gk: 'Beaten across goal.',
      },
    },
  ],
}
