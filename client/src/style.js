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
        min-width: 320px;
        max-width: 400px;
        height: auto;
        min-height: 0;
        max-height: calc(100vh - 32px);
        overflow-y: auto;
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
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .search-input {
        flex: 1;
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

    .route-button {
        background: #4285F4;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .route-button:hover {
        background: #3367D6;
    }

    .route-button:active {
        background: #2A56C6;
    }

    /* Stops list styles */
    .stops-list {
        margin-bottom: 16px;
        border-top: 1px solid #e0e0e0;
        padding-top: 16px;
    }

    .stops-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .stops-header h3 {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }

    .optimize-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .optimize-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .optimize-btn:active {
        transform: translateY(0);
    }

    .no-stops {
        text-align: center;
        color: #666;
        font-size: 13px;
        padding: 20px 0;
        font-style: italic;
    }

    .stops-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: calc(100vh - 400px);
        overflow-y: auto;
    }

    .stop-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        cursor: grab;
        transition: all 0.2s ease;
        position: relative;
    }

    .stop-item:hover {
        background: #e9ecef;
        border-color: #dee2e6;
    }

    .stop-item.dragging {
        opacity: 0.5;
        transform: rotate(2deg);
        cursor: grabbing;
    }

    .stop-handle {
        color: #6c757d;
        font-size: 12px;
        cursor: grab;
        user-select: none;
    }

    .stop-content {
        flex: 1;
        min-width: 0;
    }

    .stop-name {
        font-size: 13px;
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .stop-coordinates {
        font-size: 11px;
        color: #6c757d;
    }

    .stop-edit-input {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #007bff;
        border-radius: 4px;
        font-size: 13px;
        background: white;
    }

    .stop-actions {
        display: flex;
        gap: 4px;
    }

    .stop-edit-btn,
    .stop-delete-btn {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        font-size: 12px;
    }

    .stop-edit-btn:hover {
        background: rgba(0, 123, 255, 0.1);
    }

    .stop-delete-btn:hover {
        background: rgba(220, 53, 69, 0.1);
    }

    /* Route information styles */
    .route-info {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
    }

    .route-summary {
        background: #e3f2fd;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 12px;
        font-size: 13px;
        line-height: 1.4;
    }

    .route-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .route-leg {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 8px 12px;
    }

    .leg-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }

    .leg-number {
        background: #007bff;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
    }

    .leg-name {
        font-size: 13px;
        font-weight: 500;
        color: #333;
        flex: 1;
    }

    .leg-details {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #6c757d;
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

    /* Scrollbar styling */
    .stops-container::-webkit-scrollbar {
        width: 6px;
    }

    .stops-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }

    .stops-container::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }

    .stops-container::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }

    .floating-menu::-webkit-scrollbar {
        width: 6px;
    }

    .floating-menu::-webkit-scrollbar-track {
        background: transparent;
    }

    .floating-menu::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }

    .floating-menu::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
`