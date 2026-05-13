import Constants from "expo-constants";

const RELEASES_API = "https://api.github.com/repos/VStahelin/remedero/releases";

export type UpdateInfo = {
  version: string;
  releaseUrl: string;
  downloadUrl: string;
};

function parseVersion(v: string): number[] {
  return v.replace(/^v/, "").split(".").map(Number);
}

function isNewer(current: string, candidate: string): boolean {
  const a = parseVersion(current);
  const b = parseVersion(candidate);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (b[i] ?? 0) - (a[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const currentVersion = Constants.expoConfig?.version ?? "0.0.0";

    const response = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) return null;

    const releases = (await response.json()) as Array<{
      tag_name: string;
      prerelease: boolean;
      draft: boolean;
      assets: Array<{ browser_download_url: string; name: string }>;
      html_url: string;
    }>;

    const latestStable = releases.find((r) => !r.prerelease && !r.draft);
    if (!latestStable) return null;

    const latestVersion = latestStable.tag_name.replace(/^v/, "");
    if (!isNewer(currentVersion, latestVersion)) return null;

    const apk = latestStable.assets.find((a) => a.name.endsWith(".apk"));

    return {
      version: latestVersion,
      releaseUrl: latestStable.html_url,
      downloadUrl: apk?.browser_download_url ?? latestStable.html_url,
    };
  } catch {
    return null;
  }
}
