import { Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * AutoAdsInfo Component
 * 
 * Displays information about Auto Ads being enabled.
 * Replaces the manual AdsManager since Auto Ads are now the only ad system.
 */
export function AutoAdsInfo() {
    const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'Not configured';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Ad Management</h2>
                    <p className="text-muted-foreground">Google AdSense Auto Ads are managing ad placements automatically.</p>
                </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6 text-green-500" />
                </div>
                <div className="space-y-2">
                    <p className="text-lg font-semibold text-green-400">Auto Ads Active</p>
                    <p className="text-sm text-green-400/80">
                        Google AdSense Auto Ads are enabled on this site. Google automatically determines the best ad placements, formats, and sizes for optimal revenue.
                    </p>
                    <ul className="text-sm text-green-400/70 list-disc list-inside space-y-1 mt-3">
                        <li>No manual ad configuration needed</li>
                        <li>Ads are hidden on admin and auth pages</li>
                        <li>Fully compliant with AdSense policies</li>
                    </ul>
                </div>
            </div>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="text-base">Configuration</CardTitle>
                    <CardDescription>Current AdSense settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">AdSense Client ID</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{adsenseClientId}</code>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Mode</span>
                        <span className="text-sm font-medium text-green-500">Auto Ads Only</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Manual Ads</span>
                        <span className="text-sm font-medium text-muted-foreground">Disabled</span>
                    </div>
                    <div className="pt-4">
                        <Button variant="outline" asChild className="w-full">
                            <a
                                href="https://www.google.com/adsense/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                            >
                                Open AdSense Dashboard
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-400">Want to customize ad placements?</p>
                    <p className="text-sm text-blue-400/80">
                        Use the <a href="https://www.google.com/adsense/" target="_blank" rel="noopener noreferrer" className="underline">Google AdSense dashboard</a> to customize Auto Ads settings, including which ad formats to show and where.
                    </p>
                </div>
            </div>
        </div>
    );
}
