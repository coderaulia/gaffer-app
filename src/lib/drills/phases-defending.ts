import type { Phase } from '../types'

/** Coaching phases for the defending manual. */
export const DEFENDING_PHASES: Record<string, Phase[]> = {
  'def-1': [
    {
      t0: 0,
      t1: 1.2,
      title: 'Show stance',
      text: 'Body angled sideways, weight on the balls of the feet, knees bent — showing the attacker onto their weaker foot.',
      focus: ['def', 'atk'],
      cues: {
        def: 'Angled stance, hips square to his body — not to the ball.',
        atk: 'Attack at pace. Change direction and speed to unbalance him.',
      },
    },
    {
      t0: 1.2,
      t1: 3.4,
      title: 'Jockey, do not dive in',
      text: 'The first job is to slow him down, not win the ball. A rushed tackle that is beaten is worse than a jockey that buys time.',
      focus: ['def', 'atk'],
      cues: {
        def: 'Match his speed backwards at about an arm’s length. Never cross your feet.',
        atk: 'Attack his leading foot to open the show side.',
      },
    },
    {
      t0: 3.4,
      t1: 5.2,
      title: 'Read the take-on cue',
      text: 'The cue is a touch pushed away from the attacker’s body. Commit only when that touch is heavy.',
      focus: ['def', 'atk'],
      cues: {
        def: 'Watch for the heavy touch. That is the only moment to commit.',
        atk: 'Change of direction — force him to open his hips.',
      },
    },
    {
      t0: 5.2,
      t1: 6,
      title: 'Commit',
      text: 'Reward delays that let a covering defender arrive, even when the ball is not won.',
      focus: ['def', 'atk'],
      cues: {
        def: 'Touch is heavy — now go, front foot across the ball.',
        atk: 'Shot away before the tackle lands.',
      },
    },
  ],

  'def-2': [
    {
      t0: 0,
      t1: 2,
      title: 'Recover into the cover angle',
      text: 'The cover defender starts 5m behind and must recover onto a diagonal behind and slightly inside the first defender.',
      focus: ['d1', 'd2'],
      cues: {
        d1: 'Pressure the carrier, but the aim is to force him one way — not to win it.',
        d2: 'Sprint into the diagonal behind and inside him. Square is useless.',
        a1: 'Attack at pace, look for the pass.',
        a2: 'Stay wide to stretch the two defenders.',
      },
    },
    {
      t0: 2,
      t1: 4.6,
      title: 'Show him into the cover',
      text: 'The most common breakdown is the first defender showing the attacker the wrong way — into open space instead of toward the cover.',
      focus: ['d1', 'd2', 'a1'],
      cues: {
        d1: 'Show him into the cover defender’s zone. Never into the middle.',
        d2: 'Call it: "show left". Read the pass lane, not the ball.',
        a1: 'Blocked from the middle — the pass is the option.',
      },
    },
    {
      t0: 4.6,
      t1: 6.6,
      title: 'Step up on the pass',
      text: 'The moment the ball goes wide into your zone, step up to intercept or double-team.',
      focus: ['d2', 'a2', 'd1'],
      cues: {
        d2: 'Ball is played — step up and engage immediately.',
        d1: 'Recover inside and become the new cover.',
        a2: 'Receiving under immediate pressure.',
      },
    },
    {
      t0: 6.6,
      t1: 8,
      title: 'Block or intercept',
      text: 'Reward blocks and interceptions equally with winning the ball. A blocked pass that forces a reset is just as valuable.',
      focus: ['d2', 'd1'],
      cues: {
        d2: 'Block it. A forced reset counts.',
        d1: 'Cover behind in case it breaks.',
      },
    },
  ],

  'def-3': [
    {
      t0: 0,
      t1: 3,
      title: 'Compact base shape',
      text: 'Roughly 25 to 30m between the backline and the front two, and no more than 10m between neighbours in the midfield line.',
      focus: ['lcb', 'rcb', 'lcm', 'rcm', 'st1', 'st2'],
      cues: {
        lb: 'Hold the line as a unit. Step up together on a backward pass.',
        rb: 'When the ball is far side, tuck in narrow.',
        lcm: 'Own a zone, not a player. Track the ball’s position.',
        rcm: 'Screen the lane into the strikers — show them wide.',
        st1: 'Curve the press to cut the pass back into midfield.',
        st2: 'Stay connected to the midfield line.',
      },
    },
    {
      t0: 3,
      t1: 7.1,
      title: 'Shift as one',
      text: 'The block is only effective if all four lines move together. Watch for one line arriving late to a shift.',
      focus: ['rb', 'rcb', 'rcm', 'rm'],
      cues: {
        rm: 'Press the ball, but stay connected to your line.',
        rcm: 'Shift with him. No more than 10m apart.',
        rb: 'Slide across with the ball.',
        lb: 'Weak side — tuck in and cover in front of the far centre back.',
      },
    },
    {
      t0: 7.1,
      t1: 9.5,
      title: 'The switch',
      text: 'A fast diagonal switch tests whether the block can shift quickly enough to stay connected.',
      focus: ['lm', 'lcm', 'lb', 'c1'],
      cues: {
        lm: 'Switch is coming — sprint across, you are the new ball-side player.',
        lb: 'Recover width fast.',
        lcm: 'Do not get strung out. Stay within 10m of the man beside you.',
      },
    },
    {
      t0: 9.5,
      t1: 12,
      title: 'Reconnect',
      text: 'Measure compactness with cones before the session, then check against them during play.',
      focus: ['lb', 'lcb', 'lm'],
      cues: {
        lm: 'Shape restored on the new ball side.',
        st1: 'Drop to maintain compactness if the ball goes back deep.',
      },
    },
  ],

  'def-4': [
    {
      t0: 0,
      t1: 2.6,
      title: 'Block the switch',
      text: 'Cutting off the pass across the pitch is the most important individual job in the drill. Without it there is no trap.',
      focus: ['f1', 'f2', 'a5'],
      cues: {
        f1: 'Cover shadow must block the switch. Do not press yet.',
        f2: 'Show them toward the trap zone.',
        a5: 'The switch is unavailable — you are being cut off deliberately.',
        a1: 'Building out, being shown one way.',
      },
    },
    {
      t0: 2.6,
      t1: 6.2,
      title: 'Show them to the trap',
      text: 'Patience before the trigger matters as much as speed after it. A press that starts early invites a switch into the vacated space.',
      focus: ['f1', 'f2', 'a2', 'a3'],
      cues: {
        f1: 'Still patient. Wait for the cue.',
        m1: 'Hold your position until the trigger appears.',
        a2: 'Play into the wide man — which is exactly what they want.',
        a3: 'Receiving in the trap zone.',
      },
    },
    {
      t0: 6.2,
      t1: 8.2,
      title: 'Trigger: press together',
      text: 'The trigger is a pass into the trap zone, a back pass, a heavy touch or a player facing his own goal. Two to three defenders press simultaneously.',
      focus: ['f1', 'm1', 'm2', 'a3'],
      cues: {
        f1: 'Trigger seen — press now, aggressively.',
        m1: 'Press with him. One presser alone gets played through.',
        m2: 'Close the lane behind him — remove the easy out-ball.',
        a3: 'Trapped against the touchline.',
      },
    },
    {
      t0: 8.2,
      t1: 10,
      title: 'Win it or reset',
      text: 'Count how many presses win the ball in the trap versus how many are played through. If the ball escapes, reset into base shape rather than chase.',
      focus: ['m1', 'm2', 'a4'],
      cues: {
        m1: 'Second pass under pressure — that is the one to intercept.',
        m2: 'Stay alert to the rushed pass to the nearest man.',
        a4: 'Forced backwards into the touchline.',
      },
    },
  ],

  'def-5': [
    {
      t0: 0,
      t1: 1.6,
      title: 'React inside two seconds',
      text: 'The most common fault is a slow first reaction — players watching the turnover happen instead of moving instantly.',
      focus: ['p1', 'o1'],
      cues: {
        p1: 'Ball is lost — go now. Cut the forward options before trying to win it.',
        p2: 'Swarm with him, angle to force him backward.',
        p3: 'Third presser. Cover the second lane.',
        p4: 'Drop into cover — do not sprint blindly at the ball.',
        o1: 'You have just won it, and three players are already on you.',
      },
    },
    {
      t0: 1.6,
      t1: 3.8,
      title: 'Swarm and angle',
      text: 'Angle the press to force him backward or sideways, away from goal. Only three press at once.',
      focus: ['p1', 'p2', 'p3', 'o1'],
      cues: {
        p1: 'Force him backwards, away from goal.',
        p2: 'Cut the forward pass first.',
        p5: 'Cover the long ball that would bypass the press entirely.',
        o1: 'Forced sideways under pressure.',
      },
    },
    {
      t0: 3.8,
      t1: 6.3,
      title: 'Watch the lanes',
      text: 'Committing everyone with no cover behind invites one pass to bypass the whole counter-press. Keep one or two covering.',
      focus: ['p4', 'p5', 'o2'],
      cues: {
        p4: 'Cover position. Watch the lanes, not the ball.',
        o2: 'The out-ball. Play it long before the press closes.',
        p3: 'Squeeze the second receiver.',
      },
    },
    {
      t0: 6.3,
      t1: 8,
      title: 'Five seconds, then reset',
      text: 'If it is not won inside five seconds, stop the individual chase and reset into base shape. Communicate with a single shout.',
      focus: ['p1', 'p2', 'p3'],
      cues: {
        p1: 'Window gone — call the reset.',
        p2: 'Stop chasing. Recover shape together.',
      },
    },
  ],

  'def-6': [
    {
      t0: 0,
      t1: 2.5,
      title: 'Pressure the delivery',
      text: 'Angle the body to force a lower-quality cross rather than standing off. The aim is to affect the cross, not win the ball out wide.',
      focus: ['dp', 'cr'],
      cues: {
        dp: 'Close him down and angle the body. Do not dive in.',
        dn: 'Track the near-post runner tight, stay goal side.',
        df: 'Read the flight from the moment his head goes down.',
        de: 'Cover the edge for cutbacks. Never follow the ball into the six-yard box.',
        gk: 'Command the six-yard box. Decide early.',
      },
    },
    {
      t0: 2.5,
      t1: 3.9,
      title: 'Zones, not eyes',
      text: 'Two defenders arriving in the same zone leaves another unmarked. Zonal discipline matters more than following the ball with the eyes.',
      focus: ['dn', 'df', 'de'],
      cues: {
        dn: 'Near post is yours — attack anything played there.',
        df: 'Far post is yours. Stay goal side of the runner.',
        de: 'Hold the edge. Do not get drawn in.',
        af: 'Attacking the far post from wide.',
      },
    },
    {
      t0: 3.9,
      t1: 4.9,
      title: 'Attack the far post ball',
      text: 'Be ready to attack anything that carries beyond the goalkeeper’s reach.',
      focus: ['df', 'af', 'gk'],
      cues: {
        df: 'Attack it — anything beyond the keeper is yours.',
        af: 'Contesting at the back post.',
        gk: 'Stay on the line for anything beyond the six-yard box.',
      },
    },
    {
      t0: 4.9,
      t1: 6,
      title: 'Clear the danger',
      text: 'Reward clean headers away from danger as highly as blocks or claims — clearing the immediate threat is often the correct first priority.',
      focus: ['df', 'de'],
      cues: {
        df: 'Height, distance, width. Clear it properly.',
        de: 'Ready for the second ball on the edge.',
      },
    },
  ],

  'def-7': [
    {
      t0: 0,
      t1: 3.4,
      title: 'Call the numbers',
      text: 'Silence is the most common cause of a broken overload defense. Insist on clear, early communication before the ball arrives.',
      focus: ['d1', 'd2', 'd5'],
      cues: {
        d1: 'Call it: "we have 2 v 3, show inside". Delay, do not commit.',
        d2: 'Cut the passing angles between them rather than lunging.',
        d3: 'Shift centrally now — weak-side width is the lowest priority.',
        d5: 'Stay behind the ball. Your value is the covering position.',
        o1: 'Four of us wide against two — move it quickly.',
      },
    },
    {
      t0: 3.4,
      t1: 6.2,
      title: 'Delay the overload',
      text: 'Track how often the team delays long enough for a covering player to arrive, not only whether the ball was won.',
      focus: ['d1', 'd2', 'd3', 'd4'],
      cues: {
        d1: 'Keep delaying. Every second lets cover arrive.',
        d3: 'Protect the gap that opens centrally.',
        d4: 'Tuck in. Cover the space, not a man.',
        o2: 'Quick combination to get behind them.',
      },
    },
    {
      t0: 6.2,
      t1: 8.4,
      title: 'Hold the rest defence',
      text: 'A defender abandoning the rest-defence position is the single biggest cause of conceding on the counter-attack.',
      focus: ['d5', 'd1', 'o3'],
      cues: {
        d5: 'Do not get drawn into the wide duel. Hold your position.',
        d1: 'Block the delivery if you can get there.',
        o3: 'Free in the wide area — deliver early.',
      },
    },
    {
      t0: 8.4,
      t1: 10,
      title: 'Defend the box',
      text: 'If the overload is broken up, reorganise into base shape before pushing numbers forward again.',
      focus: ['d2', 'd3', 'd4', 'gk'],
      cues: {
        d2: 'Attack the cross, first contact.',
        d3: 'Pick up the far-post runner.',
        gk: 'Command what you can reach.',
      },
    },
  ],
}
