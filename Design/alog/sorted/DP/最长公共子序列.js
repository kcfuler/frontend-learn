/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */

/**
 * 例子：
 * a b c d e
 * a c e
 * 最长公共子序列，字母依次遍历
 * dp[i][j] -> s1[i]
 * if (s1[i] === s2[j]) {
 *
 * }
 * */
var longestCommonSubsequence = function(text1, text2) {
    const m = text1.length;
    const n = text2.length;

    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
};