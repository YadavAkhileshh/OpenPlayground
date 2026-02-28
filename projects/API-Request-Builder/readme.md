
# API Request Builder

A tiny client-side utility to compose and send HTTP requests from the browser. Useful for testing simple APIs, experimenting with query parameters, request bodies and Basic auth.

**Features**
- Compose HTTP requests: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- Add query parameters and body parameters (JSON or urlencoded).
- Basic HTTP authentication support.
- Displays response status, headers and formatted JSON body when available.

**Usage**
- Open [projects/API-Request-Builder/index.html](projects/API-Request-Builder/index.html) in your browser.
- For local development, serve the folder to avoid CORS issues (for example):

	- `npx http-server .` or
	- `python -m http.server 8000`

- Enter the target `URL` and `Path`, add any parameters or body content, then click `send`.

**Notes**
- This is a client-side tool — cross-origin requests will be subject to the target server's CORS policy.
- The app uses `XMLHttpRequest`, so modern browsers will behave normally; some servers may reject requests without proper headers.

**Contributing**
- Small improvements, fixes or accessibility tweaks are welcome. Open a PR against the `main` branch.

**License**
- See repository root for licensing information.
