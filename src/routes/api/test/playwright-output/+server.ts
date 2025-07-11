import { json, type RequestHandler } from '@sveltejs/kit';
import { ContentFetcher } from '$lib/scan/ContentFetcher';
import { PatternConfigLoader } from '$lib/scan/PatternConfigLoader';
import { PatternMatcher } from '$lib/scan/PatternMatcher';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return json({ error: 'Missing url query parameter' }, { status: 400 });
  }

  try {
    // 1. Fetch content
    const contentFetcher = new ContentFetcher();
    const result = await contentFetcher.execute(targetUrl, 'playwright', false);

    const outputDir = path.resolve('docs', 'test');
    await fs.mkdir(outputDir, { recursive: true });

    // 2. Save raw HTML output
    const htmlOutputPath = path.join(outputDir, 'playwright-output.html');
    await fs.writeFile(htmlOutputPath, result.html, 'utf-8');

    // 3. Load HTML into Cheerio for analysis
    const $ = cheerio.load(result.html);

    // 4. Initialize tools for module analysis
    const configLoader = PatternConfigLoader.getInstance();
    const patternMatcher = new PatternMatcher();

    // 5. Analyze with AICitation module
    const aiCitationConfig = await configLoader.loadConfig('AICitation');
    const citationSignals = patternMatcher.matchPatterns(result.html, $, aiCitationConfig);
    const citationOutputPath = path.join(outputDir, 'aicitation-output.json');
    await fs.writeFile(citationOutputPath, JSON.stringify(citationSignals, null, 2), 'utf-8');

    // 6. Analyze with AIContent module
    const aiContentConfig = await configLoader.loadConfig('AIContent');
    const contentSignals = patternMatcher.matchPatterns(result.html, $, aiContentConfig);
    const contentOutputPath = path.join(outputDir, 'aicontent-output.json');
    await fs.writeFile(contentOutputPath, JSON.stringify(contentSignals, null, 2), 'utf-8');

    return json({
      message: 'Successfully fetched and analyzed content.',
      url: targetUrl,
      outputs: {
        html: htmlOutputPath,
        aiCitation: citationOutputPath,
        aiContent: contentOutputPath
      }
    });
  } catch (error) {
    console.error('Error during Playwright fetch and analysis test:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json({ error: 'Failed to fetch or analyze content', details: errorMessage }, { status: 500 });
  }
};
