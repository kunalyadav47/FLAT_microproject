/**
 * Pumping Lemma Interactive Labs:
 * Implements formal Adversary Game models for proving non-regularity of Regular Languages
 * and non-context-freeness of CFLs.
 * Compatible with Browser and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PumpingLemmaEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Regular Language Pumping Lemma Adversary Game
   * Models languages:
   * 1. L = { a^n b^n | n >= 0 }
   * 2. L = { w w^R | w in {0, 1}* }
   * 3. L = { 0^(n^2) | n >= 1 }
   */
  const RegularCases = {
    an_bn: {
      id: 'an_bn',
      name: 'L = { aⁿ bⁿ | n ≥ 0 }',
      alphabet: ['a', 'b'],
      condition: 'String must consist of n a\'s followed by exactly n b\'s.',
      generateString(p) {
        return {
          w: 'a'.repeat(p) + 'b'.repeat(p),
          description: `Chosen w = a^${p} b^${p} where |w| = ${2 * p} ≥ p.`
        };
      },
      checkMembership(str) {
        const match = str.match(/^(a*)(b*)$/);
        if (!match) return { inLanguage: false, reason: 'Contains characters out of order (e.g. b before a).' };
        const numA = match[1].length;
        const numB = match[2].length;
        if (numA === numB) {
          return { inLanguage: true, reason: `Number of a's (${numA}) equals number of b's (${numB}).` };
        }
        return { inLanguage: false, reason: `Number of a's (${numA}) does NOT equal number of b's (${numB}).` };
      },
      pump(rawP, yLength, i) {
        const p = Math.max(1, parseInt(rawP, 10) || 1);
        const yLen = Math.max(1, Math.min(yLength, p));
        const xLen = 0; // standard adversary positioning
        const zLenA = Math.max(0, p - (xLen + yLen));
        const zLenB = p;

        const x = 'a'.repeat(xLen);
        const y = 'a'.repeat(yLen);
        const z = 'a'.repeat(zLenA) + 'b'.repeat(zLenB);

        const pumpedStr = x + y.repeat(i) + z;
        const mem = this.checkMembership(pumpedStr);

        const explanation = i === 1
          ? `Since exponent i=1, the pumped string is the original string w = a^${p}b^${p}, which is in L. The adversary must select i ≠ 1 (such as i=0 or i ≥ 2) to demonstrate the contradiction.`
          : `Since |xy| ≤ p, substring y = a^${yLen} contains only 'a's. Pumping with exponent i=${i} yields string with ${p + (i - 1) * yLen} a's and ${p} b's. Since ${p + (i - 1) * yLen} ≠ ${p}, the pumped string is NOT in L!`;

        return {
          x, y, z,
          i,
          pumpedStr,
          inLanguage: mem.inLanguage,
          reason: mem.reason,
          explanation
        };
      }
    },

    palindrome: {
      id: 'palindrome',
      name: 'L = { w wᴿ | w ∈ {0, 1}* }',
      alphabet: ['0', '1'],
      condition: 'Even-length palindromes.',
      generateString(rawP) {
        const p = Math.max(1, parseInt(rawP, 10) || 1);
        return {
          w: '0'.repeat(p) + '1'.repeat(p) + '1'.repeat(p) + '0'.repeat(p),
          description: `Chosen w = 0^${p} 1^${2 * p} 0^${p} where |w| = ${4 * p} ≥ p.`
        };
      },
      checkMembership(str) {
        if (str.length % 2 !== 0) return { inLanguage: false, reason: 'Odd length cannot be of form w w^R.' };
        const mid = str.length / 2;
        const w = str.slice(0, mid);
        const wR = str.slice(mid).split('').reverse().join('');
        if (w === wR) {
          return { inLanguage: true, reason: `First half matches reversal of second half.` };
        }
        return { inLanguage: false, reason: `First half does not match reversal of second half.` };
      },
      pump(rawP, yLength, i) {
        const p = Math.max(1, parseInt(rawP, 10) || 1);
        const yLen = Math.max(1, Math.min(yLength, p));
        const x = '';
        const y = '0'.repeat(yLen);
        const z = '0'.repeat(Math.max(0, p - yLen)) + '1'.repeat(2 * p) + '0'.repeat(p);

        const pumpedStr = x + y.repeat(i) + z;
        const mem = this.checkMembership(pumpedStr);

        const explanation = i === 1
          ? `Since exponent i=1, the pumped string is the original string w, which is in L. Select i ≠ 1 to break symmetry.`
          : `Since |xy| ≤ p, substring y is in the leading 0s. Pumping changes leading 0 count without changing trailing 0 count, breaking palindrome symmetry!`;

        return {
          x, y, z,
          i,
          pumpedStr,
          inLanguage: mem.inLanguage,
          reason: mem.reason,
          explanation
        };
      }
    }
  };

  /**
   * Context-Free Language Pumping Lemma Adversary Game
   * Models L = { a^n b^n c^n | n >= 1 }
   */
  const CFLCases = {
    an_bn_cn: {
      id: 'an_bn_cn',
      name: 'L = { aⁿ bⁿ cⁿ | n ≥ 1 }',
      condition: 'Equal number of a\'s, b\'s, and c\'s in sequence.',
      generateString(rawP) {
        const p = Math.max(1, parseInt(rawP, 10) || 1);
        return {
          w: 'a'.repeat(p) + 'b'.repeat(p) + 'c'.repeat(p),
          description: `Chosen w = a^${p} b^${p} c^${p} where |w| = ${3 * p} ≥ p.`
        };
      },
      checkMembership(str) {
        const match = str.match(/^(a*)(b*)(c*)$/);
        if (!match) return { inLanguage: false, reason: 'Symbols not strictly in a* b* c* order.' };
        const na = match[1].length;
        const nb = match[2].length;
        const nc = match[3].length;
        if (na === nb && nb === nc && na > 0) {
          return { inLanguage: true, reason: `Equal counts: na=${na}, nb=${nb}, nc=${nc}.` };
        }
        return { inLanguage: false, reason: `Unequal counts: a=${na}, b=${nb}, c=${nc}.` };
      },
      pump(rawP, option = 'ab', i = 2) {
        const minP = option === 'aa' ? 2 : 1;
        const p = Math.max(minP, parseInt(rawP, 10) || minP);

        // |vxy| <= p means vxy cannot contain all 3 symbols (it can contain at most 2 types of symbols)
        let u = '', v = 'a', x = '', y = 'b', z = '';

        if (option === 'ab') {
          // v is in a's, y is in b's
          u = 'a'.repeat(Math.max(0, p - 1));
          v = 'a';
          x = '';
          y = 'b';
          z = 'b'.repeat(Math.max(0, p - 1)) + 'c'.repeat(p);
        } else if (option === 'bc') {
          // v is in b's, y is in c's
          u = 'a'.repeat(p) + 'b'.repeat(Math.max(0, p - 1));
          v = 'b';
          x = '';
          y = 'c';
          z = 'c'.repeat(Math.max(0, p - 1));
        } else {
          // v and y are both in a's
          u = 'a'.repeat(Math.max(0, p - 2));
          v = 'a';
          x = '';
          y = 'a';
          z = 'b'.repeat(p) + 'c'.repeat(p);
        }

        const pumpedStr = u + v.repeat(i) + x + y.repeat(i) + z;
        const mem = this.checkMembership(pumpedStr);

        const explanation = i === 1
          ? `Since exponent i=1, the pumped string is the original string w = a^${p}b^${p}c^${p}, which is in L. The adversary must choose i ≠ 1 (e.g. i=0 or i=2) to force an unequal letter count.`
          : `Because |vxy| ≤ p, the subsegment vxy can span at most two different letters (e.g. only a's and b's, or only b's and c's). When pumped with i=${i}, the count of those letters changes while the third letter remains fixed at ${p}. Hence counts cannot remain equal, proving L is NOT Context-Free!`;

        return {
          u, v, x, y, z,
          i,
          pumpedStr,
          inLanguage: mem.inLanguage,
          reason: mem.reason,
          explanation
        };
      }
    }
  };

  return {
    RegularCases,
    CFLCases
  };
});
