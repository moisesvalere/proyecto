document.addEventListener('DOMContentLoaded', () => {
    fetchAndUpdateChannels();
    setInterval(fetchAndUpdateChannels, 30000);

    // Inicialmente ocultar los contenedores
    document.getElementById('player-container').style.display = 'none';
    document.getElementById('iframe-container').style.display = 'none';

    // Configurar el botón de cerrar del reproductor
    document.getElementById('close-player').addEventListener('click', () => {
        const playerContainer = document.getElementById('player-container');
        playerContainer.style.display = 'none';
        
        // Detener el reproductor
        const playerInstance = jwplayer("aRzklaXf");
        if (playerInstance) {
            playerInstance.remove(); // Eliminar el reproductor
        }
    });

    // Configurar el botón de cerrar del iframe
    document.getElementById('close-iframe').addEventListener('click', () => {
        const iframeContainer = document.getElementById('iframe-container');
        iframeContainer.style.display = 'none';
        
        // Detener la reproducción del iframe
        const iframe = document.getElementById('videoFrame');
        iframe.src = ''; // Detener el iframe al limpiar la fuente
    });
});

let currentChannels = [];
let currentIframes = [];

function fetchAndUpdateChannels() {
    fetch('deporte.m3u')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const { channels, iframes } = parseM3U(data);
            currentChannels = channels;
            currentIframes = iframes;
            displayChannels(channels);
            setupSearch(channels);
            displayIframes(iframes);
        })
        .catch(error => console.error('Error fetching M3U file:', error));
}

function parseM3U(data) {
    const lines = data.split('\n');
    const channels = [];
    const iframes = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF')) {
            const logoMatch = lines[i].match(/tvg-logo="([^"]+)"/);
            const logo = logoMatch ? logoMatch[1] : '';
            
            const titleMatch = lines[i].match(/group-title="[^"]*",([^,]+)/);
            const title = titleMatch ? titleMatch[1] : '';
            
            const url = lines[i + 1] ? lines[i + 1].trim() : '';

            if (logo && title && url) {
                channels.push({ logo, title, url });
            }
        } else if (lines[i].startsWith('#IFRAME')) {
            const logoMatch = lines[i].match(/tvg-logo="([^"]+)"/);
            const logo = logoMatch ? logoMatch[1] : '';
            
            const titleMatch = lines[i].match(/group-title="[^"]*",([^,]+)/);
            const title = titleMatch ? titleMatch[1] : '';
            
            const url = lines[i + 1] ? lines[i + 1].trim() : '';

            if (logo && title && url) {
                iframes.push({ logo, title, url });
            }
        }
    }

    return { channels, iframes };
}

function displayChannels(channels) {
    const container = document.getElementById('channels-container');
    container.innerHTML = '';

    if (channels.length === 0) {
        container.textContent = 'No se encontraron canales.';
        return;
    }

    channels.forEach(channel => {
        const channelElement = document.createElement('div');
        channelElement.className = 'channel';

        const logoElement = document.createElement('img');
        logoElement.src = channel.logo;
        logoElement.alt = channel.title;
        logoElement.addEventListener('click', () => {
            updatePlayer(channel.url);
        });

        const titleElement = document.createElement('h2');
        titleElement.textContent = channel.title;

        channelElement.appendChild(logoElement);
        channelElement.appendChild(titleElement);
        container.appendChild(channelElement);
    });
}

function displayIframes(iframes) {
    const container = document.getElementById('channels-container');
    iframes.forEach(iframe => {
        const iframeElement = document.createElement('div');
        iframeElement.className = 'channel';

        const logoElement = document.createElement('img');
        logoElement.src = iframe.logo;
        logoElement.alt = iframe.title;
        logoElement.addEventListener('click', () => {
            updateIframe(iframe.url);
        });

        const titleElement = document.createElement('h2');
        titleElement.textContent = iframe.title;

        iframeElement.appendChild(logoElement);
        iframeElement.appendChild(titleElement);
        container.appendChild(iframeElement);
    });
}

function updatePlayer(url) {
    jwplayer("aRzklaXf").setup({
        "file": url,
        "height": "560",
        "width": "100%",
        stretching: "bestfit",
        "image": "#",
        "mediaid": "player",
        "mute": false,
        "autostart": true,
        "cast": {
            "appid": "player",
            "logo": "https://i.ibb.co/Tgk2YrC/Logo.png",
        },
    });

    const playerContainer = document.getElementById('player-container');
    playerContainer.style.display = 'flex';
}

function updateIframe(url) {
    const iframeContainer = document.getElementById('iframe-container');
    const iframe = document.getElementById('videoFrame');
    iframe.src = url;

    iframeContainer.style.display = 'flex';
}

function setupSearch(channels) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredChannels = channels.filter(channel =>
                channel.title.toLowerCase().includes(searchTerm)
            );
            displayChannels(filteredChannels);
        });
    }
}
