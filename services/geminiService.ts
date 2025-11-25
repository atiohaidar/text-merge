import { MergeSegment, SegmentType } from '../types';

// Tokenizes text into words, punctuation, and whitespace to preserve formatting
const tokenize = (text: string): string[] => {
  if (!text) return [];
  return text.split(/(\s+|[.,!?;:"'()\[\]{}])/g).filter(t => t.length > 0);
};

// Standard LCS Dynamic Programming implementation
const computeLCS = (a: string[], b: string[]) => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
};

type DiffOp = { type: 'EQ' | 'DEL' | 'INS'; text: string };

const getDiffOps = (a: string[], b: string[]): DiffOp[] => {
  const dp = computeLCS(a, b);
  const ops: DiffOp[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: 'EQ', text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: 'INS', text: b[j - 1] });
      j--;
    } else {
      ops.push({ type: 'DEL', text: a[i - 1] });
      i--;
    }
  }
  return ops.reverse();
};

// Internal 2-way merge logic
const mergeTwoTexts = async (textA: string, textB: string): Promise<MergeSegment[]> => {
  return new Promise((resolve) => {
    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);
    const ops = getDiffOps(tokensA, tokensB);

    const segments: MergeSegment[] = [];
    let currentBlock: DiffOp[] = [];

    const flushBlock = () => {
      if (currentBlock.length === 0) return;

      const hasDel = currentBlock.some(op => op.type === 'DEL');
      const hasIns = currentBlock.some(op => op.type === 'INS');
      const hasEq = currentBlock.some(op => op.type === 'EQ');

      if (hasEq) {
        segments.push({
          type: SegmentType.CONTENT,
          content: currentBlock.map(op => op.text).join('')
        });
      } 
      else if (hasDel && hasIns) {
        segments.push({
          type: SegmentType.CONFLICT,
          optionA: currentBlock.filter(op => op.type === 'DEL').map(op => op.text).join(''),
          optionB: currentBlock.filter(op => op.type === 'INS').map(op => op.text).join(''),
          reason: "Versions differ here"
        });
      }
      else if (hasDel) {
        segments.push({
          type: SegmentType.CONTENT,
          content: currentBlock.map(op => op.text).join('')
        });
      }
      else if (hasIns) {
        segments.push({
          type: SegmentType.CONTENT,
          content: currentBlock.map(op => op.text).join('')
        });
      }
      currentBlock = [];
    };

    ops.forEach(op => {
      if (op.type === 'EQ') {
        if (currentBlock.length > 0 && currentBlock[0].type !== 'EQ') {
          flushBlock();
        }
        currentBlock.push(op);
      } else {
        if (currentBlock.length > 0 && currentBlock[0].type === 'EQ') {
          flushBlock();
        }
        currentBlock.push(op);
      }
    });
    
    flushBlock();

    const mergedSegments: MergeSegment[] = [];
    segments.forEach(seg => {
      if (mergedSegments.length > 0 && 
          mergedSegments[mergedSegments.length - 1].type === SegmentType.CONTENT && 
          seg.type === SegmentType.CONTENT) {
        mergedSegments[mergedSegments.length - 1].content += seg.content;
      } else {
        mergedSegments.push(seg);
      }
    });

    resolve(mergedSegments);
  });
};

// Helper to flatten segments back to string for iterative merging
// We prefer 'B' (Incoming) to ensure the next comparison is against the latest state
const segmentsToString = (segments: MergeSegment[]): string => {
    return segments.map(seg => {
        if (seg.type === SegmentType.CONTENT) return seg.content || '';
        if (seg.type === SegmentType.CONFLICT) return seg.optionB || ''; // Assume "latest" wins for intermediate steps
        return '';
    }).join('');
};

export const mergeMultipleTexts = async (texts: string[]): Promise<MergeSegment[]> => {
    if (texts.length === 0) return [];
    if (texts.length === 1) return [{ type: SegmentType.CONTENT, content: texts[0] }];

    let currentBase = texts[0];
    let currentSegments: MergeSegment[] = [];

    // Iteratively merge: (1+2) -> Result. (Result+3) -> Final.
    for (let i = 1; i < texts.length; i++) {
        currentSegments = await mergeTwoTexts(currentBase, texts[i]);
        
        // If there are more texts to process, flatten the current result to use as the base for the next pass
        if (i < texts.length - 1) {
            currentBase = segmentsToString(currentSegments);
        }
    }

    return currentSegments;
};