// Service Worker for WellSwap PWA
// PWA 기능을 위한 서비스 워커

const CACHE_NAME = 'wellswap-v1.0.0';
const STATIC_CACHE = 'wellswap-static-v1.0.0';
const DYNAMIC_CACHE = 'wellswap-dynamic-v1.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// 네트워크 우선, 캐시 폴백 전략
const NETWORK_FIRST_STRATEGY = 'network-first';
const CACHE_FIRST_STRATEGY = 'cache-first';
const STALE_WHILE_REVALIDATE_STRATEGY = 'stale-while-revalidate';

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 정적 파일 캐싱 중...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ 오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// fetch 이벤트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API 요청은 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 정적 파일은 캐시 우선
  if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticFile(request));
    return;
  }
  
  // HTML 페이지는 네트워크 우선
  if (request.destination === 'document') {
    event.respondWith(handleDocumentRequest(request));
    return;
  }
  
  // 기타 요청은 stale-while-revalidate
  event.respondWith(handleOtherRequest(request));
});

// API 요청 처리 (네트워크 우선)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 성공한 API 응답을 동적 캐시에 저장
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 API 요청 실패, 캐시에서 복원 시도:', error);
    
    // 캐시에서 복원 시도
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 응답
    return new Response(
      JSON.stringify({ error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 정적 파일 처리 (캐시 우선)
async function handleStaticFile(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📁 정적 파일 로드 실패:', error);
    return new Response('정적 파일을 찾을 수 없습니다.', { status: 404 });
  }
}

// HTML 문서 처리 (네트워크 우선)
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📄 HTML 문서 로드 실패, 캐시에서 복원 시도:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 페이지 반환
    return caches.match('/offline.html') || new Response(
      '<html><body><h1>오프라인 상태</h1><p>네트워크 연결을 확인해주세요.</p></body></html>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// 기타 요청 처리 (stale-while-revalidate)
async function handleOtherRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // 네트워크 실패 시 캐시된 응답 반환
      return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
  } catch (error) {
    console.error('Request handling error:', error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

// 정적 파일 여부 확인
function isStaticFile(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('🔄 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// 백그라운드 동기화 수행
async function performBackgroundSync() {
  try {
    // 오프라인 중에 저장된 데이터 동기화
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      await syncData(data);
    }
    
    console.log('✅ 백그라운드 동기화 완료');
  } catch (error) {
    console.error('❌ 백그라운드 동기화 실패:', error);
  }
}

// 오프라인 데이터 가져오기
async function getOfflineData() {
  // IndexedDB에서 오프라인 데이터 가져오기
  return [];
}

// 데이터 동기화
async function syncData(data) {
  // 서버에 데이터 동기화
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('동기화 실패');
  }
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('📱 푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('WellSwap', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('👆 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 메시지 처리
self.addEventListener('message', (event) => {
  console.log('💬 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🔧 WellSwap Service Worker 로드됨');
