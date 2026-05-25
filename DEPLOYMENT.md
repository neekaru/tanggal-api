# Deployment Guide

## Requirements

### Node.js Version
- **Minimum**: Node.js 20.0.0 or higher
- **Recommended**: Node.js 20.x, 22.x, or 24.x

### Supported Platforms

wreq-js includes prebuilt native binaries for:

| Platform | Architecture | libc | Binary |
|----------|--------------|------|--------|
| Linux | x64 | glibc | `wreq-js.linux-x64-gnu.node` |
| Linux | x64 | musl | `wreq-js.linux-x64-musl.node` |
| Linux | ARM64 | glibc | `wreq-js.linux-arm64-gnu.node` |
| Linux | ARM64 | musl | `wreq-js.linux-arm64-musl.node` |
| macOS | x64 (Intel) | - | `wreq-js.darwin-x64.node` |
| macOS | ARM64 (Apple Silicon) | - | `wreq-js.darwin-arm64.node` |
| Windows | x64 | MSVC | `wreq-js.win32-x64-msvc.node` |

## Hosting Environment Setup

### Vercel / Netlify / AWS Lambda
- Ensure Node.js 20+ runtime is selected
- Native binaries are automatically included in deployment
- No additional build steps required

### Docker
Use a Node.js 20+ base image:

```dockerfile
FROM node:20-alpine
# or
FROM node:20-slim
```

For Alpine Linux (musl), the `wreq-js.linux-x64-musl.node` binary will be used automatically.

### Traditional VPS / Dedicated Server
1. Install Node.js 20+:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the scraper:
   ```bash
   npm start
   ```

## Troubleshooting

### "Failed to load native module" Error

If you see this error:
```
Failed to load native module for linux-x64-gnu. Tried: ../rust/wreq-js.linux-x64-gnu.node
```

**Solutions:**

1. **Check Node.js version**:
   ```bash
   node --version  # Should be >= 20.0.0
   ```

2. **Verify platform compatibility**:
   ```bash
   node -e "console.log(process.platform, process.arch)"
   # Should output: linux x64 (or darwin arm64, etc.)
   ```

3. **Check if native binary exists**:
   ```bash
   ls -la node_modules/wreq-js/rust/*.node
   ```

4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **For unsupported platforms**: wreq-js will attempt to build from source, which requires:
   - Rust toolchain (https://rustup.rs/)
   - Build tools (gcc, make, etc.)

### Memory Limits

wreq-js native binaries are ~7-8MB each. Ensure your hosting environment has sufficient memory:
- Minimum: 512MB RAM
- Recommended: 1GB+ RAM

## Environment Variables

No special environment variables are required for wreq-js to function.

## Testing Deployment

Test the scraper in your hosting environment:

```bash
node -e "const { fetch } = require('wreq-js'); console.log('wreq-js loaded successfully');"
```

Then run the full scraper:

```bash
npm start
```

Expected output:
```
[scrape] Timeanddate responded with 200
[scrape] Kalenderku responded with 200
[scrape] Tanggalan responded with 200
```

## Performance Notes

- wreq-js uses browser TLS fingerprinting to bypass Cloudflare protection
- First request may be slower due to TLS handshake
- Subsequent requests benefit from connection pooling
- Cache TTL is set to 7 days to reduce API calls
