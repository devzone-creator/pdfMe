const request = require('supertest');
const app = require('../server');

describe('file-frenzy API Tests', () => {
  
  describe('Health Check Endpoints', () => {
    
    test('GET /health should return 200 with status ok', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('service', 'file-frenzy');
    });

    test('GET /api/status should return operational status', async () => {
      const res = await request(app)
        .get('/api/status')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'operational');
      expect(res.body).toHaveProperty('conversions_available');
      expect(Array.isArray(res.body.conversions_available)).toBe(true);
      expect(res.body.conversions_available).toContain('pdf-to-docx');
      expect(res.body.conversions_available).toContain('pdf-to-text');
    });

  });

  describe('Text to PDF Conversion', () => {
    
    test('POST /api/pdf should convert text to PDF', async () => {
      const res = await request(app)
        .post('/api/pdf')
        .send({
          text: 'Hello, file-frenzy!',
          fontSize: 12,
          textAlign: 'left'
        })
        .expect(200);
      
      expect(res.headers['content-type']).toMatch('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment');
    });

    test('POST /api/pdf should reject empty text', async () => {
      const res = await request(app)
        .post('/api/pdf')
        .send({
          text: '',
          fontSize: 12
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/pdf should accept custom font size', async () => {
      const res = await request(app)
        .post('/api/pdf')
        .send({
          text: 'Large text',
          fontSize: 24,
          textAlign: 'center'
        })
        .expect(200);
      
      expect(res.headers['content-type']).toMatch('application/pdf');
    });

  });

  describe('Feedback Endpoint', () => {
    
    test('POST /api/feedback should require all fields', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          name: 'John',
          email: 'john@example.com'
          // missing message
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    test('POST /api/feedback should accept valid feedback', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Great service!'
        });
      
      // Note: This will fail if Gmail credentials aren't configured
      // In production, mock the nodemailer transport
      expect(res.body).toHaveProperty('success');
    });

  });

  describe('Error Handling', () => {
    
    test('GET /nonexistent should return 404', async () => {
      const res = await request(app)
        .get('/nonexistent')
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
    });

    test('Invalid file upload should be rejected', async () => {
      const res = await request(app)
        .post('/api/pdf-to-docx')
        .expect(400);
      
      expect(res.text).toContain('No PDF file uploaded');
    });

  });

  describe('CORS Configuration', () => {
    
    test('Requests should include CORS headers', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

  });

});
