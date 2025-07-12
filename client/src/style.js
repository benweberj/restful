import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    html, body, #root {
        height: 100%;
        min-height: 100vh;
        width: 100%;
    }
    body {
        min-height: 100vh;
        width: 100%;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: none;
    }

    .full {
        height: 100%;
        width: 100%;
    }

    /* Radar pulse animations */
    @keyframes radarPulse {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(0, 255, 0, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
        }
    }

    @keyframes radarPulseBlue {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
        }
    }

    .marker-user {
        width: 20px;
        height: 20px;
        background-color: #00ff00;
        border-radius: 50%;
        border: 2px solid #fff;
        animation: radarPulse 2s infinite;
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 1000;
    }

    .marker-target {
        width: 20px;
        height: 20px;
        background-color: #007bff;
        border-radius: 50%;
        border: 2px solid #fff;
        animation: radarPulseBlue 2s infinite;
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 1000;
    }

    /* Floating menu styles */
    .floating-menu {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 3;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
        padding: 16px;
        min-width: 280px;
        backdrop-filter: blur(10px);
    }

    .floating-menu-title {
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 14px;
        color: #333;
    }

    .search-container {
        margin-bottom: 16px;
    }

    .search-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 14px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: border-color 0.2s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 1px 3px rgba(0, 123, 255, 0.2);
    }

    .toggle-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .toggle-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #333;
    }

    .toggle-item input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
    }

    .toggle-item label {
        cursor: pointer;
        user-select: none;
    }

    .toggle-divider {
        margin: 12px 0 8px 0;
        border-top: 1px solid #e0e0e0;
    }

    /* Pulsing marker animation */
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
        }
        70% {
            box-shadow: 0 0 0 12px rgba(0, 0, 0, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
    }
`