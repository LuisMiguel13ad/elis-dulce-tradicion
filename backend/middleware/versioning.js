/**
 * API Versioning Middleware
 * Adds version header and handles deprecation warnings
 */

export const versioningMiddleware = (req, res, next) => {
  // Check for version in header
  const requestedVersion = req.headers['x-api-version'] || '1.0';
  
  // Set response header
  res.setHeader('X-API-Version', '1.0');
  
  // Check if using legacy (non-versioned) routes
  if (!req.path.startsWith('/api/v1/') && req.path.startsWith('/api/')) {
    // Add deprecation warning
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Deprecation-Message', 
      'This endpoint is deprecated. Please use /api/v1/ prefix. Legacy routes will be removed in v2.0');
  }
  
  // Attach version to request
  req.apiVersion = requestedVersion;
  
  next();
};

export const requireVersion = (minVersion) => {
  return (req, res, next) => {
    const requestedVersion = parseFloat(req.apiVersion || '1.0');
    const minVersionNum = parseFloat(minVersion);
    
    if (requestedVersion < minVersionNum) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VERSION_TOO_OLD',
          message: `API version ${requestedVersion} is too old. Minimum version is ${minVersion}`,
        },
      });
    }
    
    next();
  };
};
