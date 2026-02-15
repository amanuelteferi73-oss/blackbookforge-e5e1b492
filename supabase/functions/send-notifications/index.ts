import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DISCIPLINE_RULES = [
  { id: 1, title: "Pick the hardest build, learn and do" },
  { id: 2, title: "Feel the pain all the way - this is what can make you who you wanna be" },
  { id: 3, title: "I don't see the reason you are f*cking giving up, there is no option" },
  { id: 4, title: "We can have it all - pick them wisely and show me just doing it" },
  { id: 5, title: "This time crushing it not small task" },
  { id: 6, title: "Order is our schema - ain't we got it after 6 we are still here not there" },
  { id: 7, title: "You need consistence ain't fuel" },
  { id: 8, title: "Everything is gonna be your fault - not even a single complain of country or situation" },
  { id: 9, title: "Private success lead to victory not vice versa" },
  { id: 10, title: "This is just start not the end" },
  { id: 11, title: "World won't go anywhere unless we stayed tune - so do it, don't wanna see you sleeping" },
  { id: 12, title: "Follow one niche this time - I don't see any reason it is gonna fail" },
  { id: 13, title: "Have a fuel you can put on fire which is the agent we are building" },
  { id: 14, title: "Don't spend your time with taker not giver" },
  { id: 15, title: "For the responsibility problem we are gonna blame anyone" },
  { id: 16, title: "Don't be a f*cking prisoner to any of them - enjoy doing them" },
  { id: 17, title: "Don't compare yourself with others - you do it with yourself" },
  { id: 18, title: "Always we are positive even in ocean" },
  { id: 19, title: "Protect your mind not only growing it" },
  { id: 20, title: "Control what you can if what you can't" },
  { id: 21, title: "Speeeeeeeeeeeeeed - we are robot ok, not human anymore" },
  { id: 22, title: "Ignore what others think about you" },
  { id: 23, title: "We are always ambitious to listen that car sound, to live there, to make them shout their mouth" },
  { id: 24, title: "Prioritize your health" },
  { id: 25, title: "Keep your promise to be Elon Musk and Masayoshi Son" },
  { id: 26, title: "Thanks to our situation - not enjoyment for us yet even if we are young" },
  { id: 27, title: "Fail is a f*cking master - you will call it soon a legendary" },
  { id: 28, title: "Winners don't quit, quitters never win" },
  { id: 29, title: "We are not rich yet - don't give even a single penny" },
  { id: 30, title: "Don't f*cking fear money - cause if it can make you broke it can make you rich too" },
  { id: 31, title: "One victory covers all the failure" },
  { id: 32, title: "Money is the tool not the goal" },
  { id: 33, title: "Your network is your networth" },
  { id: 34, title: "If dad ain't drop it so who can you call yourself?" },
  { id: 35, title: "Build the system then you will see how it matter" },
  { id: 36, title: "Next stop will be on billions not even millions" },
  { id: 37, title: "Luck is when preparation meets opportunity so don't wait for it - show me who you are" },
];

function getRandomRule() {
  return DISCIPLINE_RULES[Math.floor(Math.random() * DISCIPLINE_RULES.length)];
}

function getHoursUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
}

// Base64url encode
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Base64url decode
function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

// Generate VAPID keys using Web Crypto
async function generateVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  );

  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return {
    publicKey: base64urlEncode(new Uint8Array(publicKeyRaw)),
    privateKey: privateKeyJwk.d!,
  };
}

// Create VAPID JWT
async function createVapidJwt(audience: string, privateKeyB64: string, publicKeyB64: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: 'mailto:forge@app.com',
  };

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64urlDecode(privateKeyB64);
  const publicKeyBytes = base64urlDecode(publicKeyB64);

  // Build JWK for import
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: privateKeyB64,
    x: base64urlEncode(publicKeyBytes.slice(1, 33)),
    y: base64urlEncode(publicKeyBytes.slice(33, 65)),
  };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format if needed
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // Already raw from Web Crypto
    rawSig = sigBytes;
  }

  return `${unsignedToken}.${base64urlEncode(rawSig)}`;
}

// Encrypt push payload using RFC 8291
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const localPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', localKeyPair.publicKey));

  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    'raw',
    base64urlDecode(p256dhKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: subscriberKey },
      localKeyPair.privateKey,
      256
    )
  );

  const authSecretBytes = base64urlDecode(authSecret);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF for IKM: info = "WebPush: info\0" + subscriber_key + local_key
  const subscriberKeyBytes = base64urlDecode(p256dhKey);
  const infoIkm = new Uint8Array([
    ...encoder.encode('WebPush: info\0'),
    ...subscriberKeyBytes,
    ...localPublicKeyRaw,
  ]);

  const ikmKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']);
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: authSecretBytes, info: infoIkm },
      ikmKey,
      256
    )
  );

  // Derive content encryption key (CEK)
  const cekInfo = encoder.encode('Content-Encoding: aes128gcm\0');
  const cekBaseKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  const cekBits = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: salt, info: cekInfo },
      cekBaseKey,
      128
    )
  );

  // Derive nonce
  const nonceInfo = encoder.encode('Content-Encoding: nonce\0');
  const nonceBaseKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  const nonce = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: salt, info: nonceInfo },
      nonceBaseKey,
      96
    )
  );

  // Encrypt with AES-128-GCM
  // Add padding: delimiter byte (2) + no padding
  const paddedPayload = new Uint8Array([...payloadBytes, 2]);

  const cekKey = await crypto.subtle.importKey('raw', cekBits, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cekKey, paddedPayload)
  );

  // Build aes128gcm content coding header
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, paddedPayload.length + 16); // ciphertext + tag
  const header = new Uint8Array([
    ...salt,
    ...recordSize,
    localPublicKeyRaw.length,
    ...localPublicKeyRaw,
  ]);

  const ciphertext = new Uint8Array([...header, ...encrypted]);

  return { ciphertext, salt, localPublicKey: localPublicKeyRaw };
}

// Send a single web push notification
async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; status: number; error?: string }> {
  try {
    const payloadStr = JSON.stringify(payload);
    const { ciphertext } = await encryptPayload(payloadStr, p256dh, auth);

    // Create VAPID authorization
    const endpointUrl = new URL(endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
    const jwt = await createVapidJwt(audience, vapidPrivateKey, vapidPublicKey);
    const vapidAuth = `vapid t=${jwt}, k=${vapidPublicKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Authorization': vapidAuth,
        'TTL': '86400',
        'Urgency': 'high',
      },
      body: ciphertext,
    });

    const responseText = await response.text();

    if (response.status === 201 || response.status === 200) {
      return { success: true, status: response.status };
    }

    return { success: false, status: response.status, error: responseText };
  } catch (error) {
    return { success: false, status: 0, error: error.message };
  }
}

function json(data: object, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);

    // GET: Return VAPID public key (auto-generates if not exists)
    if (req.method === 'GET') {
      const action = url.searchParams.get('action');
      if (action === 'vapid-public-key') {
        const { data } = await supabase
          .from('notification_config')
          .select('value')
          .eq('key', 'vapid_public_key')
          .single();

        if (data) {
          return json({ publicKey: data.value });
        }

        // Generate new VAPID keys
        const vapidKeys = await generateVapidKeys();
        await supabase.from('notification_config').insert([
          { key: 'vapid_public_key', value: vapidKeys.publicKey },
          { key: 'vapid_private_key', value: vapidKeys.privateKey },
        ]);

        console.log('[SEND-NOTIFICATIONS] Generated new VAPID keys');
        return json({ publicKey: vapidKeys.publicKey });
      }

      return json({ error: 'Invalid action' }, 400);
    }

    // POST: Send notifications to all subscribers (called by pg_cron)
    if (req.method === 'POST') {
      // Get VAPID keys from DB
      const { data: configs } = await supabase
        .from('notification_config')
        .select('key, value')
        .in('key', ['vapid_public_key', 'vapid_private_key']);

      if (!configs || configs.length < 2) {
        return json({ error: 'VAPID keys not configured. Call GET ?action=vapid-public-key first.' }, 500);
      }

      const vapidPublicKey = configs.find(c => c.key === 'vapid_public_key')!.value;
      const vapidPrivateKey = configs.find(c => c.key === 'vapid_private_key')!.value;

      // Get all push subscriptions
      const { data: subs, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (subsError) {
        console.error('[SEND-NOTIFICATIONS] Error fetching subscriptions:', subsError);
        return json({ error: 'Failed to fetch subscriptions' }, 500);
      }

      if (!subs || subs.length === 0) {
        console.log('[SEND-NOTIFICATIONS] No subscriptions found');
        return json({ message: 'No subscriptions to notify', sent: 0 });
      }

      const hoursLeft = getHoursUntilMidnightUTC();
      const results: Array<{ userId: string; type: string; status: string; error?: string }> = [];

      for (const sub of subs) {
        // Send discipline reminder (every call = every hour via cron)
        const rule = getRandomRule();
        const disciplineResult = await sendPushNotification(
          sub.endpoint,
          sub.p256dh,
          sub.auth,
          {
            type: 'discipline',
            title: `🔥 RULE #${rule.id}`,
            body: `${rule.title}\n\nRemember who you are becoming.`,
            url: '/',
          },
          vapidPublicKey,
          vapidPrivateKey
        );

        results.push({
          userId: sub.user_id,
          type: 'discipline',
          status: disciplineResult.success ? 'sent' : 'failed',
          error: disciplineResult.error,
        });

        // Clean up expired subscriptions
        if (disciplineResult.status === 410 || disciplineResult.status === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          results[results.length - 1].status = 'removed-expired';
          continue;
        }

        // Send check-in reminder if within 3 hours of midnight UTC
        if (hoursLeft <= 3) {
          const isUrgent = hoursLeft <= 1;
          const checkinResult = await sendPushNotification(
            sub.endpoint,
            sub.p256dh,
            sub.auth,
            {
              type: 'checkin',
              title: isUrgent ? '🔴 URGENT: CHECK-IN DEADLINE' : '⏰ CHECK-IN REMINDER',
              body: isUrgent
                ? `Only ${Math.round(hoursLeft)} HOUR remaining! Complete your check-in NOW!`
                : `${Math.round(hoursLeft)} HOURS remaining. Check in before midnight.`,
              url: '/check-in',
            },
            vapidPublicKey,
            vapidPrivateKey
          );

          results.push({
            userId: sub.user_id,
            type: 'checkin',
            status: checkinResult.success ? 'sent' : 'failed',
            error: checkinResult.error,
          });
        }
      }

      console.log(`[SEND-NOTIFICATIONS] Processed ${subs.length} subscriptions, hours until midnight: ${hoursLeft.toFixed(1)}`);
      return json({
        sent: results.filter(r => r.status === 'sent').length,
        total: results.length,
        hoursUntilMidnight: Math.round(hoursLeft * 10) / 10,
        results,
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('[SEND-NOTIFICATIONS] Error:', error);
    return json({ error: error.message }, 500);
  }
});
