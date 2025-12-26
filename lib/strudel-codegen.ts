import { StrudelSample } from './services/github-service';

interface SampleLike {
  name: string;
  sourceUrl: string;
  filePath?: string;
}

/**
 * Generate Strudel code snippet for a single sample
 */
export function generateStrudelCode(sample: StrudelSample | SampleLike): string {
  const sampleName = sample.name.replace(/[^a-zA-Z0-9_]/g, '_');
  return `s("${sample.name}").sound("${sample.sourceUrl}")`;
}

/**
 * Generate Strudel code for multiple samples
 */
export function generateStrudelCodeForSamples(samples: (StrudelSample | SampleLike)[]): string {
  if (samples.length === 0) {
    return '// No samples selected';
  }

  if (samples.length === 1) {
    return generateStrudelCode(samples[0]);
  }

  // Generate code for multiple samples
  const sampleCodes = samples.map((sample, index) => {
    const sampleName = sample.name.replace(/[^a-zA-Z0-9_]/g, '_');
    return `  s("${sampleName}").sound("${sample.sourceUrl}")`;
  });

  return `stack(\n${sampleCodes.join(',\n')}\n)`;
}

/**
 * Generate Strudel code for a collection with patterns
 */
export function generateStrudelCodeForCollection(
  samples: (StrudelSample | SampleLike)[],
  pattern?: string
): string {
  if (samples.length === 0) {
    return '// No samples in collection';
  }

  const sampleCodes = samples.map((sample) => {
    const sampleName = sample.name.replace(/[^a-zA-Z0-9_]/g, '_');
    const baseCode = `s("${sampleName}").sound("${sample.sourceUrl}")`;
    
    if (pattern) {
      return `  ${baseCode}.pattern("${pattern}")`;
    }
    return `  ${baseCode}`;
  });

  return `stack(\n${sampleCodes.join(',\n')}\n)`;
}

