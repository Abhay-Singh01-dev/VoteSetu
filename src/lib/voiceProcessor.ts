/**
 * Checks if a query is related to elections or voting.
 * Simple keyword-based domain restriction.
 */
export function isElectionQuery(query: string): boolean {
  const q = query.toLowerCase();
  const keywords = [
    "vote", "election", "voter", "epic", "register", "registration", 
    "booth", "polling", "evm", "vvpat", "mcc", "nomination", 
    "candidate", "id", "citizen", "age", "18", "identity", 
    "card", "list", "roll", "government", "parliament", "assembly"
  ];
  
  return keywords.some(kw => q.includes(kw));
}
