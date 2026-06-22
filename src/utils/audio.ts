/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizers for Joker Game
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Synthesize Shuffle Sound (Filter modulated white noise)
export function playShuffleSound() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.4; // 0.4 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    // Play 5 quick shuffling scrapes
    for (let j = 0; j < 6; j++) {
      const timeOffset = ctx.currentTime + j * 0.08;
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, timeOffset);
      filter.frequency.exponentialRampToValueAtTime(100, timeOffset + 0.08);
      filter.Q.value = 5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, timeOffset);
      gain.gain.linearRampToValueAtTime(0.001, timeOffset + 0.07);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start(timeOffset);
      noiseNode.stop(timeOffset + 0.08);
    }
  } catch (e) {
    console.error('Audio synthesis failed:', e);
  }
}

// 2. Synthesize Card Slide/Throw (Swoosh sweep)
export function playCardThrowSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignore error
  }
}

// 3. Synthesize Card Slam on Table (Thump and wood click)
export function playCardSlamSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Deep Thump
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.linearRampToValueAtTime(45, now + 0.18);

    gain1.gain.setValueAtTime(0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // High frequency table slap click
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.linearRampToValueAtTime(400, now + 0.05);

    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.05);
  } catch (e) {
    // Ignore error
  }
}

// 4. Synthesize Timer Tick (High pitch woodblock click)
export function playTimerTickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    // Ignore
  }
}

// 5. Synthesize Coin Reward (Chime sound)
export function playCoinSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.08, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.25);
    });
  } catch (e) {
    // Ignore
  }
}

// 6. Synthesize flying emoji whoosh
export function playEmojiWhooshSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.25);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    // Ignore
  }
}

// 7. Synthesize emoji splat/hit (Tomato burst, coffee splash)
export function playEmojiSplatSound(type: 'tomato' | 'shoe' | 'coffee' | 'rose') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const baseFreq = type === 'tomato' ? 140 : type === 'coffee' ? 180 : type === 'shoe' ? 90 : 250;
    const duration = type === 'shoe' ? 0.2 : 0.35;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(80, now + duration);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    // Add noise burst for wet spray splat (except shoe/slipper)
    if (type !== 'shoe') {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const fFilt = ctx.createBiquadFilter();
      fFilt.type = 'bandpass';
      fFilt.frequency.value = 250;

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.15, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(fFilt);
      fFilt.connect(nGain);
      nGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.15);
    }
  } catch (e) {
    // Ignore
  }
}

// 8. Voice Pack Narrator using the Browser Web Speech API SpeechSynthesis
// Includes Egyptian, Gulf, and Levantine dialects with customizable sentences!
export type Dialect = 'egypt' | 'gulf' | 'levant';

export const ArabicVoiceTexts = {
  egypt: {
    start: 'يلا يا رجالة، نلعب ونتسلى. بسم الله!',
    bid: (b: number) => `طلب ${b}! هاص يا معلم!`,
    pass: 'باس، ماليش فيها.',
    spades: 'الترنيب باص، الشغل تقيل!',
    hearts: 'الترنيب كبة، في الحنين يا باشا!',
    diamonds: 'الترنيب ديناري، الفلوس منورة!',
    clubs: 'الترنيب سباتي، يلا بينا!',
    wonTrick: 'قشيت الأكلة دي! يا عيني علينا!',
    lostTrick: 'أكلناها! معلش الجاية لينا.',
    winGame: 'كابوووت! كسبنا الماتش وحوش الجوكر يا ملوك!',
    loseGame: 'خسرنا! الهزيمة بتعلم، هارد لك.',
    emoji_tomato: 'إيه الطماطم دي يا بويا؟ ركز في اللعب!',
    emoji_shoe: 'شبشب طائر؟ جرا إيه يا جماعة!',
    emoji_coffee: 'تسلم إيدك على القهوة الممتازة دي!',
    emoji_rose: 'يا عمري على الورد وجماله! حبيبي.',
  },
  gulf: {
    start: 'يا هلا بالربع، خلونا نلعب طقها وإلحقها!',
    bid: (b: number) => `أبشر، أطلب ${b}!`,
    pass: 'طوف، باس يا جماعة.',
    spades: 'الترنيب سبيتل، دربكم خضر!',
    hearts: 'الترنيب هيرت، كبة يا ملوك!',
    diamonds: 'الترنيب ديمن، زانت السالفة!',
    clubs: 'الترنيب شري، يلا همتكم!',
    wonTrick: 'جبناها يا شيخ الكار! كفو والله كفو!',
    lostTrick: 'غرزت الورقة! خيرها بغيرها يا الربع.',
    winGame: 'فزنا بالمباراة! والنوماس لنا يا الجوكر!',
    loseGame: 'راحت علينا هالمرة، الجايات أفضل!',
    emoji_tomato: 'منو رماني بالطماط؟ علموني!',
    emoji_shoe: 'أفا! نعال طاير بالطاولة؟ عيب والله عيب!',
    emoji_coffee: 'كفو على فنجان هالقهوة الطيبة الدواية!',
    emoji_rose: 'شكراً عالوردة يا غالي، كلك ذوق!',
  },
  levant: {
    start: 'يا ميت أهلاً وسهلاً بالشباب، منلعب ونتسلى!',
    bid: (b: number) => `تمنياتي، بطلب ${b}!`,
    pass: 'باص يا خيو، ما في نصيب.',
    spades: 'الترنيب باص سبيت، شغل مرتب!',
    hearts: 'الترنيب كبة هارت، على راسي الحبايب!',
    diamonds: 'الترنيب ديناري صار، يستر على الحظ!',
    clubs: 'الترنيب سباتي صلب، همتكم يا شباب!',
    wonTrick: 'قشيناها ورب الكعبة! يسلم دياتك يا شريك!',
    lostTrick: 'أكلناها بوسطها! راحت أكلتنا معوضة.',
    winGame: 'كسبنا وصرنا سلاطين الجوكر! أحلى شباب بالكون!',
    loseGame: 'خسرنا الجولة يا حسرة، العوض بالجايات دايماً.',
    emoji_tomato: 'بندورة؟ شو هاد يا زلمة عم نعمل سلطة؟',
    emoji_shoe: 'صرماية طائرة يا لطيف! ليش العيب وحرقة الدم؟',
    emoji_coffee: 'يسلم دياتك على فنجان القهوة السخنة يا شريك!',
    emoji_rose: 'يسعد قلبك على الوردة الطيبة المتلك!',
  }
};

export function speakArabicCallout(textType: string, dialect: Dialect, bidValue?: number) {
  try {
    if (!('speechSynthesis' in window)) return;

    // Standard check / cancel previous audio
    window.speechSynthesis.cancel();

    let textToSpeak = '';
    const group = ArabicVoiceTexts[dialect] as any;
    if (typeof group[textType] === 'function') {
      textToSpeak = group[textType](bidValue);
    } else {
      textToSpeak = group[textType] || '';
    }

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    // Find an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.includes('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    } else {
      utterance.lang = 'ar-SA';
    }

    // Dialect specific features using speed & pitch
    if (dialect === 'egypt') {
      utterance.pitch = 1.05;
      utterance.rate = 1.05;
    } else if (dialect === 'gulf') {
      utterance.pitch = 0.95;
      utterance.rate = 0.93;
    } else if (dialect === 'levant') {
      utterance.pitch = 1.02;
      utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
}
