/**
 * broadcastEmail template unit tests.
 * Verifies the rich-text body is sanitized to email-safe HTML, CTA anchors are
 * converted into buttons, and the result is wrapped in the Rise email layout.
 */
import { describe, it, expect } from 'vitest';
import { broadcastEmail, renderBroadcastBody } from '../../../../src/templates/email/broadcastEmail.js';

describe('renderBroadcastBody', () => {
  it('strips dangerous tags like <script>', () => {
    const out = renderBroadcastBody('<p>Hi</p><script>alert(1)</script>');
    expect(out).toContain('<p>Hi</p>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
  });

  it('keeps inline formatting marks (bold/italic/underline)', () => {
    const out = renderBroadcastBody('<p><strong>b</strong> <em>i</em> <u>u</u></p>');
    expect(out).toContain('<strong>b</strong>');
    expect(out).toContain('<em>i</em>');
    expect(out).toContain('<u>u</u>');
  });

  it('preserves text-align on paragraphs', () => {
    const out = renderBroadcastBody('<p style="text-align:center">centered</p>');
    expect(out).toMatch(/text-align:\s*center/);
  });

  it('keeps headings h1-h3 (with alignment) but strips deeper headings', () => {
    const out = renderBroadcastBody('<h1>One</h1><h2 style="text-align:center">Two</h2><h3>Three</h3><h4>Four</h4>');
    expect(out).toContain('<h1>One</h1>');
    expect(out).toContain('Two');
    expect(out).toMatch(/<h2[^>]*text-align:\s*center/);
    expect(out).toContain('<h3>Three</h3>');
    expect(out).not.toContain('<h4');
  });

  it('forces safe target/rel and primary color on normal links', () => {
    const out = renderBroadcastBody('<p><a href="https://risesocial.org">link</a></p>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('color:#FF8E4F');
  });

  it('drops images with non-absolute sources', () => {
    const out = renderBroadcastBody('<p><img src="/uploads/x.png" alt="x"></p>');
    expect(out).not.toContain('<img');
  });

  it('keeps images with absolute https sources and constrains their width', () => {
    const out = renderBroadcastBody('<p><img src="https://cdn.example.com/x.png" alt="x"></p>');
    expect(out).toContain('https://cdn.example.com/x.png');
    expect(out).toMatch(/max-width:\s*100%/);
  });

  it('converts a CTA anchor into a button using the project layout', () => {
    const out = renderBroadcastBody('<p><a data-cta href="https://risesocial.org/daftar">Daftar Sekarang</a></p>');
    // Re-rendered as an email button (table-based, brand color), not a raw anchor.
    expect(out).toContain('Daftar Sekarang');
    expect(out).toContain('https://risesocial.org/daftar');
    expect(out).toContain('#FF8E4F');
    expect(out).not.toContain('data-cta');
  });

  it('drops a CTA without a label or href', () => {
    expect(renderBroadcastBody('<a data-cta href="https://x.com"></a>')).toBe('');
  });
});

describe('broadcastEmail', () => {
  it('wraps the sanitized body in the Rise email layout', () => {
    const html = broadcastEmail({ subject: 'My Subject', bodyText: '<p>Hello <strong>world</strong></p>' });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Hello <strong>world</strong>');
    expect(html).toContain('Bandung, West Java 40286, Indonesia');
    expect(html).toContain('© ');
  });

  it('does not render the subject as a heading in the body', () => {
    const html = broadcastEmail({ subject: 'My Subject', bodyText: '<p>Hi</p>' });
    expect(html).not.toContain('My Subject');
    expect(html).not.toContain('<h1');
  });
});
