let refreshInterval;

async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

function formatMemory(mb) {
    return `${mb} MB`;
}

function formatUptime(uptime) {
    return uptime;
}

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('lastUpdated').textContent = timeString;
}

async function updateStats() {
    const stats = await fetchData('/api/stats');
    
    if (stats) {
        document.getElementById('uptime').textContent = stats.uptime;
        document.getElementById('commandsCount').textContent = stats.commandsCount;
        document.getElementById('eventsCount').textContent = stats.eventsCount;
        document.getElementById('serversCount').textContent = stats.serversCount;
        document.getElementById('usersCount').textContent = stats.usersCount.toLocaleString();
        document.getElementById('memoryUsage').textContent = `${stats.memoryUsage.used} MB (${stats.memoryUsage.percentage}%)`;
        
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (stats.status === 'online') {
            statusDot.classList.remove('offline');
            statusText.classList.remove('offline');
            statusText.textContent = 'Online';
        } else {
            statusDot.classList.add('offline');
            statusText.classList.add('offline');
            statusText.textContent = 'Offline';
        }
        
        document.getElementById('botInfo').textContent = `${stats.botName} (ID: ${stats.botId})`;
    } else {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        statusDot.classList.add('offline');
        statusText.classList.add('offline');
        statusText.textContent = 'Offline';
    }
}

async function updateCommands() {
    const commands = await fetchData('/api/commands');
    const tbody = document.getElementById('commandsTable');
    
    if (commands && commands.length > 0) {
        tbody.innerHTML = commands.map(cmd => `
            <tr>
                <td><strong>${cmd.name}</strong></td>
                <td><span style="color: #667eea;">${cmd.category}</span></td>
                <td>${cmd.description}</td>
                <td><code style="background: rgba(102, 126, 234, 0.1); padding: 2px 8px; border-radius: 4px;">${cmd.usage}</code></td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-cell">No commands available</td></tr>';
    }
}

async function updateEvents() {
    const events = await fetchData('/api/events');
    const tbody = document.getElementById('eventsTable');
    
    if (events && events.length > 0) {
        tbody.innerHTML = events.map(evt => `
            <tr>
                <td><strong>${evt.name}</strong></td>
                <td><span style="color: #667eea;">${evt.eventType}</span></td>
                <td>${evt.description}</td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="3" class="loading-cell">No events available</td></tr>';
    }
}

async function updateSystemInfo() {
    const system = await fetchData('/api/system');
    
    if (system) {
        document.getElementById('nodeVersion').textContent = system.nodeVersion;
        document.getElementById('platform').textContent = system.platform;
        document.getElementById('arch').textContent = system.arch;
        document.getElementById('cpuModel').textContent = system.cpu.model;
        document.getElementById('cpuCores').textContent = `${system.cpu.cores} cores @ ${system.cpu.speed} MHz`;
        document.getElementById('systemUptime').textContent = system.uptime;
        document.getElementById('totalMemory').textContent = system.memory.total;
        document.getElementById('usedMemory').textContent = `${system.memory.used} (${system.memory.percentage})`;
        document.getElementById('freeMemory').textContent = system.memory.free;
    }
}

async function refreshDashboard() {
    await Promise.all([
        updateStats(),
        updateCommands(),
        updateEvents(),
        updateSystemInfo()
    ]);
    updateLastUpdated();
}

function startAutoRefresh() {
    refreshDashboard();
    refreshInterval = setInterval(refreshDashboard, 5000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
});

window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
