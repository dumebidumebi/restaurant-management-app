// app/page.tsx
"use client";

// Removed useEffect, useRef, useCallback from imports
import React, { useState } from "react"; // Import React to use React.useEffect
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // For notifications
import { Toaster } from "@/components/ui/sonner"; // Toaster component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // ShadCN Dialog
import { ArbitrageOpportunity, MarketType } from "@/app/api/arbitrage/route"; // Import MarketType

// Interface for the calculator dialog
interface CalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: ArbitrageOpportunity | null;
}

function ArbitrageCalculatorDialog({
  isOpen,
  onClose,
  opportunity,
}: CalculatorDialogProps) {
  // Added useEffect to reset stake when opportunity changes
  const [totalStake, setTotalStake] = useState<number>(100);

   React.useEffect(() => {
      // Reset total stake when a new opportunity is selected
      setTotalStake(100);
   }, [opportunity]);


  if (!opportunity) return null;

  // Recalculate stakes based on current totalStake input
  const recalculatedStakes = opportunity.outcomes_details.map((detail) => {
    const impliedOdd = 1 / detail.odds;
     // Avoid division by zero if total_implied_odds is 0 or negative (shouldn't happen with valid arb)
     const totalImplied = opportunity.total_implied_odds > 0 ? opportunity.total_implied_odds : 1;
    return (
      Math.round(
        (totalStake * (impliedOdd / totalImplied)) * 100,
      ) / 100
    );
  });

   // Function to calculate individual return
   const calculateIndividualReturn = (stake: number, decimalOdds: number): number => {
       return Math.round(stake * decimalOdds * 100) / 100;
   };

  // Calculate total return based on recalculated stakes
   const recalculatedTotalReturn = recalculatedStakes.reduce(
    (sum, stake, index) =>
      sum + calculateIndividualReturn(stake, opportunity.outcomes_details[index].odds),
    0,
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Arbitrage Calculator</DialogTitle>
          <DialogDescription>
            Calculate stakes and returns for this opportunity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p>
              <strong>Match:</strong> {opportunity.match_name}
            </p>
            <p>
              <strong>Market Type:</strong> {opportunity.market_type}
              {opportunity.market_description ? ` - ${opportunity.market_description}` : ""}
            </p>
            <p>
              <strong>Arb %:</strong>{" "}
              {opportunity.arbitrage_percentage.toFixed(2)}%
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalStake">Total Stake (€/$/£)</Label>
            <Input
              id="totalStake"
              type="number"
              min="1"
              value={totalStake}
              onChange={(e) => {
                 const value = parseFloat(e.target.value);
                 setTotalStake(isNaN(value) || value < 0 ? 0 : value);
              }}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outcome</TableHead>
                <TableHead>Bookmaker</TableHead>
                <TableHead className="text-right">Odds</TableHead>
                <TableHead className="text-right">Stake</TableHead>
                <TableHead className="text-right">Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunity.outcomes_details.map((detail, index) => (
                <TableRow key={detail.outcome_name}>
                  <TableCell>{detail.outcome_name}</TableCell>
                  <TableCell>{detail.bookmaker}</TableCell>
                  <TableCell className="text-right">
                    {detail.odds.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {recalculatedStakes[index].toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {calculateIndividualReturn(recalculatedStakes[index], detail.odds).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="text-right font-bold">
            Total Return: {recalculatedTotalReturn.toFixed(2)}
          </div>
           {/* Display total profit */}
          <div className="text-right font-bold text-green-600">
             Total Profit: {(recalculatedTotalReturn - totalStake).toFixed(2)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function ArbitrageFinderPage() {
  // SECURITY WARNING: Passing API key from client to server query params is insecure.
  // For production, handle API key securely on the server-side only.
  const [apiKey, setApiKey] = useState<string>("");
  const [region, setRegion] = useState<string>("eu");
  const [cutoff, setCutoff] = useState<string>("0");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["h2h"]); // Default to H2H
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [arbitrageData, setArbitrageData] = useState<ArbitrageOpportunity[]>(
    [],
  );
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<ArbitrageOpportunity | null>(null);

   // Removed intervalRef and paramsRef

  const handleRowClick = (opportunity: ArbitrageOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsCalculatorOpen(true);
  };

   // Reverted fetchArbitrageData back to a standard async function
  const fetchArbitrageData = async () => {
    if (!apiKey) {
      toast.error("Please enter your API Key.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setArbitrageData([]); // Clear previous results before fetching new data

    try {
      const params = new URLSearchParams({
        apiKey: apiKey, // Use state directly
        region: region, // Use state directly
        cutoff: cutoff, // Use state directly
        markets: selectedMarkets.join(","), // Use state directly
      });
      const response = await fetch(`/api/arbitrage?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`,
        );
      }

      const data: ArbitrageOpportunity[] = await response.json();
      setArbitrageData(data);
       // Only show success toast if opportunities are found
       if (data.length > 0) {
            toast.success(`Found ${data.length} arbitrage opportunities!`);
       } else {
             toast.info("No arbitrage opportunities found matching your criteria.");
       }


    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMessage =
        err.message || "An unknown error occurred while fetching data.";
      setError(errorMessage);
      toast.error("Failed to fetch data", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

   // Removed useEffect for initial fetch and interval

  const formatDateTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Example player prop market keys based on documentation [2]
  // You may need to check The Odds API documentation for the exact keys
  // for the sports and markets you are interested in.
  const playerPropMarketOptions = [
    { value: "player_points", label: "Player Points" },
    { value: "player_rebounds", label: "Player Rebounds" },
    { value: "player_assists", label: "Player Assists" },
    { value: "player_threes", label: "Player Threes" },
    { value: "player_pass_tds", label: "Player Pass TDs" },
    { value: "player_pass_yds", label: "Player Pass Yds" },
    { value: "player_rush_yds", label: "Player Rush Yds" },
    { value: "player_reception_yds", label: "Player Reception Yds" },
     { value: "pitcher_strikeouts", label: "Pitcher Strikeouts" },
     { value: "pitcher_walks", label: "Pitcher Walks" },
     { value: "batter_hits", label: "Batter Hits" },
     { value: "batter_rbis", label: "Batter RBIs" },
     { value: "batter_total_bases", label: "Batter Total Bases" },
    // Add more player prop keys as needed for relevant sports (MLB, NHL, Soccer, etc.)
    // Check https://the-odds-api.com/liveapi/guides/v4/#player-prop-odds
  ];

  const handleMarketSelect = (market: string) => {
    setSelectedMarkets((prev) => {
      if (prev.includes(market)) {
        // Prevent removing H2H if it's the only market selected
        if (prev.length === 1 && market === "h2h") {
             toast.info("Head-to-Head must be selected.");
             return prev; // Don't remove H2H
        }
        return prev.filter((m) => m !== market);
      } else {
        return [...prev, market];
      }
    });
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="h-14 bg-slate-600 pt-0 mt-0 mb-5 block"></a>{" "}
      {/* Simple Nav Placeholder */}
      <Toaster richColors />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Arbitrage Opportunity Finder</CardTitle>
          <CardDescription>
            Enter your The Odds API key and parameters to find potential
            arbitrage bets. Click on a row to use the stake calculator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password" // Use password type to obscure key
                placeholder="Your The Odds API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading} // Re-added disabled while loading
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={region}
                onValueChange={setRegion}
                disabled={isLoading}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">Europe (eu)</SelectItem>
                  <SelectItem value="us">United States (us)</SelectItem>
                  <SelectItem value="uk">United Kingdom (uk)</SelectItem>
                  <SelectItem value="au">Australia (au)</SelectItem>
                  <SelectItem value="us2">United States 2 (us2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutoff">Min. Profit Cutoff (%)</Label>
              <Input
                id="cutoff"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 1 for 1%"
                value={cutoff}
                onChange={(e) => setCutoff(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Select Markets</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMarkets.includes("h2h") ? "default" : "outline"}
                onClick={() => handleMarketSelect("h2h")}
                disabled={isLoading}
              >
                Head-to-Head
              </Button>
              {playerPropMarketOptions.map((market) => (
                <Button
                  key={market.value}
                  variant={
                    selectedMarkets.includes(market.value)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleMarketSelect(market.value)}
                  disabled={isLoading}
                >
                  {market.label}
                </Button>
              ))}
              {/* Add more buttons for other market types if needed */}
            </div>
          </div>
        </CardContent>
         {/* Re-added the manual "Find Opportunities" button */}
        <CardFooter>
             <Button onClick={fetchArbitrageData} disabled={isLoading || !apiKey}>
                {isLoading ? "Searching..." : "Find Opportunities"}
             </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="space-y-4">
           <div className="text-center text-muted-foreground">Searching for opportunities...</div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

       {/* Display data only if not loading, no error, and data is available */}
      {!isLoading && !error && arbitrageData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arbitrage Opportunities Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Match / Market</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Arb %</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Bookmaker</TableHead>
                  <TableHead className="text-right">Odds</TableHead>
                  <TableHead className="text-right">Stake (€100)</TableHead>
                  <TableHead className="text-right">Return (€100)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arbitrageData.map((arb, index) => (
                  <>
                    {/* Main Arb Row */}
                    {/* Key structure: using match ID + market key + first outcome's identifier ensures unique key per market instance */}
                    <TableRow
                      key={`arb-${arb.id}-${arb.market_key}-${arb.outcomes_details[0]?.outcome_name}-${index}`}
                      className="bg-muted/50 cursor-pointer"
                      onClick={() => handleRowClick(arb)}
                    >
                      <TableCell className="font-medium">
                        {arb.match_name}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {arb.market_type}{arb.market_description ? ` - ${arb.market_description}` : ""}
                        </span>
                      </TableCell>
                      <TableCell>{arb.league}</TableCell>
                      <TableCell>
                        {formatDateTime(arb.match_start_time_iso)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {arb.arbitrage_percentage.toFixed(2)}%
                      </TableCell>
                      <TableCell colSpan={4}></TableCell> {/* Placeholder */}
                      <TableCell className="text-right font-bold">
                        {/* Display total return once for €100 stake */}
                        {arb.total_return_for_100_stake.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {/* Outcome Rows */}
                    {arb.outcomes_details.map((detail, detailIndex) => (
                      <TableRow
                        key={`arb-${arb.id}-${arb.market_key}-${detail.outcome_name}-${detailIndex}`} // More specific key
                        className="cursor-pointer" // Make outcome rows clickable too
                        onClick={() => handleRowClick(arb)}
                      >
                        <TableCell colSpan={4}></TableCell> {/* Offset */}
                        <TableCell>{detail.outcome_name}</TableCell>
                        <TableCell>{detail.bookmaker}</TableCell>
                        <TableCell className="text-right">
                          {detail.odds.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {detail.stake.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {detail.return_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Separator Row (Optional) */}
                    {index < arbitrageData.length - 1 && (
                      <TableRow key={`separator-${arb.id}-${arb.market_key}-${index}`}>
                        {" "}
                        {/* Key based on match ID, market key, and index */}
                        <TableCell
                          colSpan={9}
                          className="h-4 border-b border-dashed"
                        ></TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

        {/* Show 'No opportunities' message only after a search has been attempted (not loading, no error, and data is empty) */}
      {!isLoading && !error && arbitrageData.length === 0 && apiKey && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No arbitrage opportunities found matching your criteria.
          </CardContent>
        </Card>
          )
      }

        {/* Message prompting for API key when it's missing and not loading */}
        {!apiKey && !isLoading && (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Please enter your API Key above and click &quot;Find Opportunities&quot; to start searching.
                </CardContent>
             </Card>
        )}


      {/* Arbitrage Calculator Dialog */}
      <ArbitrageCalculatorDialog
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        opportunity={selectedOpportunity}
      />
    </div>
  );
}
