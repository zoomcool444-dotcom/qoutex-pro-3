/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Asset,
  Candle,
  ActiveTrade,
  IndicatorConfig,
  ChartType,
  Timeframe,
  AccountState,
  TradeDirection,
  IndicatorType,
  DrawingToolType,
  DrawingItem,
  PlatformSettingsState,
} from './types';
import { ASSETS_DATA, generateInitialCandles } from './marketData';
import { audio } from './audioService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChartCanvas } from './components/ChartCanvas';
import { RightTradingPanel } from './components/RightTradingPanel';
import { MarketSelectorModal } from './components/MarketSelectorModal';
import { IndicatorDrawer } from './components/IndicatorDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';
import { DrawingsDrawer } from './components/DrawingsDrawer';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { ProfileModal } from './components/ProfileModal';
import { SignalsModal } from './components/SignalsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SupportModal } from './components/SupportModal';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
}

export default function App() {
  // Account State (matches Quotex video at 00:00 & 00:29)
  const [account, setAccount] = useState<AccountState>({
    type: 'demo',
    demoBalance: 10000.56,
    liveBalance: 0.0,
    currency: '$',
    accountId: '#94157548',
    userEmail: 'haasankhan794@gmail.com',
    userName: 'haasankhan794',
    firstName: '',
    lastName: '',
    dob: '',
    country: 'Pakistan',
    address: '',
    isVerified: false,
    twoFactorEnabled: true,
  });

  // Platform Settings State (matches Quotex video at 00:51 - 01:13)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsState>({
    language: 'English',
    timezone: '(UTC-07:00)',
    template: 'Full Night',
    gridOpacity: 8,
    autoScrolling: true,
    oneClickTrade: true,
    performanceMode: false,
    shortOrderLabel: false,
    hideTradeResults: false,
    skipSignalConfirmation: true,
    upTrendColor: '#00b074',
    downTrendColor: '#ff4a4a',
  });

  // Default Open Markets in top tabs (Gold, UKBrent OTC, EUR/USD OTC, Bitcoin OTC)
  const [openAssets, setOpenAssets] = useState<Asset[]>(() => {
    const gold = ASSETS_DATA.find((a) => a.id === 'gold-otc') || ASSETS_DATA[0];
    const ukbrent = ASSETS_DATA.find((a) => a.id === 'ukbrent-otc') || ASSETS_DATA[1];
    const uscrude = ASSETS_DATA.find((a) => a.id === 'uscrude-otc') || ASSETS_DATA[2];
    const eurusd = ASSETS_DATA.find((a) => a.id === 'eur-usd-otc') || ASSETS_DATA[3];
    const btc = ASSETS_DATA.find((a) => a.id === 'bitcoin-otc') || ASSETS_DATA[4];
    return [gold, ukbrent, uscrude, eurusd, btc];
  });

  // Current active asset: default Gold as in Screenshot
  const [selectedAsset, setSelectedAsset] = useState<Asset>(() => {
    return ASSETS_DATA.find((a) => a.id === 'gold-otc') || ASSETS_DATA[0];
  });

  // Chart configuration
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');

  // Multi-market candle cache (stores 30 days of unique price candles for every market)
  const [candlesCache, setCandlesCache] = useState<Record<string, Candle[]>>({});

  // Market Candles data for current selected asset
  const [candles, setCandles] = useState<Candle[]>(() => {
    const initialAsset = ASSETS_DATA.find((a) => a.id === 'gold-otc') || ASSETS_DATA[0];
    return generateInitialCandles(initialAsset, 60, 750);
  });

  // Active Technical Indicators
  const [indicators, setIndicators] = useState<IndicatorConfig[]>([]);

  // User-drawn Support/Resistance, Trendlines, Rays, Rectangles, Fibonacci, Gann, Triangle, etc.
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType | null>(null);

  // Active & Closed Trades
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ActiveTrade[]>([]);

  // Live Candle Countdown & UTC Clock
  const [candleCountdown, setCandleCountdown] = useState<number>(60);
  const [utcTime, setUtcTime] = useState<string>('00:00:40 (UTC-07:00)');

  // Modal & Drawer Visibilities
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isIndicatorDrawerOpen, setIsIndicatorDrawerOpen] = useState(false);
  const [isDrawingsDrawerOpen, setIsDrawingsDrawerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSignalsModalOpen, setIsSignalsModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Active sidebar tab
  const [sidebarTab, setSidebarTab] = useState<
    'trade' | 'drawings' | 'indicators' | 'settings' | 'account' | 'support'
  >('trade');

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Market Sentiment State (Matching Quotex Video: green/red line moving dynamically with candles)
  const [marketSentiment, setMarketSentiment] = useState<{ buyPercent: number; sellPercent: number }>({
    buyPercent: 27,
    sellPercent: 73,
  });

  // Toast notification queue
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'error', title: string, message: string) => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const getTimeframeSeconds = (tf: Timeframe): number => {
    switch (tf) {
      case '5s': return 5;
      case '10s': return 10;
      case '15s': return 15;
      case '30s': return 30;
      case '1m':
      case '1M': return 60;
      case '2m': return 120;
      case '5m':
      case '5M': return 300;
      case '10m': return 600;
      case '15m':
      case '15M': return 900;
      case '30m': return 1800;
      case '1h':
      case '1H': return 3600;
      case '4h': return 14400;
      case '1d':
      case '1D': return 86400;
      default: return 60;
    }
  };

  // Clock timer updating UTC Time and Candle Countdown
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      const tz = platformSettings.timezone || '(UTC-07:00)';
      // Offset -7 hours for UTC-07:00
      const utcOffsetMs = tz.includes('-07:00') ? -7 * 60 * 60 * 1000 : 0;
      const targetTime = new Date(now.getTime() + utcOffsetMs);

      const h = targetTime.getUTCHours().toString().padStart(2, '0');
      const m = targetTime.getUTCMinutes().toString().padStart(2, '0');
      const s = targetTime.getUTCSeconds().toString().padStart(2, '0');
      setUtcTime(`${h}:${m}:${s} ${tz}`);

      const tfSec = getTimeframeSeconds(timeframe);
      const epochSec = Math.floor(now.getTime() / 1000);
      const rem = tfSec - (epochSec % tfSec);
      setCandleCountdown(rem);
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [timeframe, platformSettings.timezone]);

  // Market Asset Switching: updates chart candles immediately
  const handleSelectAsset = (newAsset: Asset) => {
    if (newAsset.id === selectedAsset.id) return;

    // Cache current candles
    setCandlesCache((prev) => ({
      ...prev,
      [selectedAsset.id]: candles,
    }));

    // If not in open tabs, add it
    setOpenAssets((prev) => {
      if (!prev.some((a) => a.id === newAsset.id)) {
        return [...prev, newAsset];
      }
      return prev;
    });

    setSelectedAsset(newAsset);

    // Retrieve cached or generate fresh unique 30-day series
    if (candlesCache[newAsset.id] && candlesCache[newAsset.id].length > 0) {
      setCandles(candlesCache[newAsset.id]);
    } else {
      const freshCandles = generateInitialCandles(newAsset, getTimeframeSeconds(timeframe), 750);
      setCandles(freshCandles);
      setCandlesCache((prev) => ({
        ...prev,
        [newAsset.id]: freshCandles,
      }));
    }

    // Update initial market sentiment matching Quotex video
    if (newAsset.id.includes('crude')) {
      setMarketSentiment({ buyPercent: 50, sellPercent: 50 });
    } else if (newAsset.id.includes('gold')) {
      setMarketSentiment({ buyPercent: 17, sellPercent: 83 });
    } else if (newAsset.id.includes('brent')) {
      setMarketSentiment({ buyPercent: 27, sellPercent: 73 });
    } else {
      setMarketSentiment({ buyPercent: 52, sellPercent: 48 });
    }

    audio.playClick();
    addToast('info', 'Market Changed', `Active chart: ${newAsset.name} (${newAsset.payout1m}% payout)`);
  };

  // Close an asset tab
  const handleCloseAssetTab = (assetId: string) => {
    if (openAssets.length <= 1) return;

    const remaining = openAssets.filter((a) => a.id !== assetId);
    setOpenAssets(remaining);

    if (selectedAsset.id === assetId) {
      handleSelectAsset(remaining[0]);
    }
  };

  // Real-time market tick engine: normal realistic speed matching Quotex
  useEffect(() => {
    const tfSec = getTimeframeSeconds(timeframe);
    const stepMs = tfSec * 1000;

    const interval = setInterval(() => {
      setCandles((prevCandles) => {
        if (!prevCandles || prevCandles.length === 0) return prevCandles;

        const last = prevCandles[prevCandles.length - 1];
        const now = Date.now();
        const currentBucket = Math.floor(now / stepMs) * stepMs;

        // Realistic micro-fluctuation for current candle
        const maxFluctuation = selectedAsset.basePrice * 0.00016;
        const delta = (Math.random() - 0.495) * maxFluctuation;
        const newClose = +(last.close + delta).toFixed(selectedAsset.decimals);

        // Dynamic market sentiment calculation based on live candle movement (matches Quotex video)
        const candleOpen = currentBucket > last.time ? last.close : last.open;
        const candleMove = newClose - candleOpen;
        const candleRange = Math.max(last.high - last.low, selectedAsset.basePrice * 0.0001);
        const candleRatio = Math.max(-1, Math.min(1, candleMove / candleRange));

        setMarketSentiment((prev) => {
          let baseBuy = 50;
          if (selectedAsset.id.includes('gold')) baseBuy = 20;
          else if (selectedAsset.id.includes('brent')) baseBuy = 26;
          else if (selectedAsset.id.includes('crude')) baseBuy = 50;

          // If candle goes up, buyers % surges; if candle falls, sellers % surges
          const targetBuy = Math.round(baseBuy + candleRatio * 32 + (Math.random() - 0.48) * 4);
          const clampedTarget = Math.max(8, Math.min(92, targetBuy));
          const blendedBuy = Math.round(prev.buyPercent * 0.35 + clampedTarget * 0.65);
          const finalBuy = Math.max(5, Math.min(95, blendedBuy));
          return {
            buyPercent: finalBuy,
            sellPercent: 100 - finalBuy,
          };
        });

        if (currentBucket > last.time) {
          const newCandle: Candle = {
            time: currentBucket,
            open: last.close,
            high: Math.max(last.close, newClose),
            low: Math.min(last.close, newClose),
            close: newClose,
            volume: Math.floor(Math.random() * 25) + 5,
          };
          const trimmed = prevCandles.length > 500 ? prevCandles.slice(1) : prevCandles;
          return [...trimmed, newCandle];
        } else {
          // Normal development of current candle
          const updatedLast: Candle = {
            ...last,
            close: newClose,
            high: Math.max(last.high, newClose),
            low: Math.min(last.low, newClose),
            volume: last.volume + 1,
          };
          return [...prevCandles.slice(0, -1), updatedLast];
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsset, timeframe]);

  // Live price cache by assetId for reliable trade expiry evaluation
  const latestPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (candles.length > 0 && selectedAsset) {
      latestPricesRef.current[selectedAsset.id] = candles[candles.length - 1].close;
    }
  }, [candles, selectedAsset]);

  // Active trades evaluation loop: continuous 250ms countdown that never resets prematurely
  useEffect(() => {
    const tradeTimer = setInterval(() => {
      const now = Date.now();

      setActiveTrades((prevTrades) => {
        if (!prevTrades || prevTrades.length === 0) return prevTrades;

        const stillActive: ActiveTrade[] = [];
        const expiredTrades: {
          trade: ActiveTrade;
          isWon: boolean;
          isDraw: boolean;
          exitPrice: number;
        }[] = [];

        for (const trade of prevTrades) {
          const rem = Math.max(0, Math.ceil((trade.expiryTime - now) / 1000));
          const currentPrice =
            latestPricesRef.current[trade.assetId] ??
            trade.currentPrice ??
            trade.entryPrice;

          const updatedTrade: ActiveTrade = {
            ...trade,
            currentPrice,
            remainingSeconds: rem,
          };

          if (rem <= 0) {
            const isWon =
              trade.direction === 'call'
                ? currentPrice > trade.entryPrice
                : currentPrice < trade.entryPrice;
            const isDraw = currentPrice === trade.entryPrice;

            expiredTrades.push({
              trade: updatedTrade,
              isWon,
              isDraw,
              exitPrice: currentPrice,
            });
          } else {
            stillActive.push(updatedTrade);
          }
        }

        if (expiredTrades.length > 0) {
          expiredTrades.forEach(({ trade, isWon, isDraw, exitPrice }) => {
            if (isWon) {
              const returnTotal = trade.amount + trade.potentialProfit;
              setAccount((acc) => ({
                ...acc,
                demoBalance:
                  acc.type === 'demo'
                    ? +(acc.demoBalance + returnTotal).toFixed(2)
                    : acc.demoBalance,
                liveBalance:
                  acc.type === 'live'
                    ? +(acc.liveBalance + returnTotal).toFixed(2)
                    : acc.liveBalance,
              }));

              try {
                confetti({
                  particleCount: 65,
                  spread: 70,
                  origin: { y: 0.65 },
                });
              } catch {}
              audio.playTradeWon();
              addToast(
                'success',
                'Trade Won! 🚀',
                `+$${trade.potentialProfit.toFixed(2)} Profit on ${trade.assetName} (Entry: ${trade.entryPrice.toFixed(4)}, Exit: ${exitPrice.toFixed(4)})`
              );
            } else if (isDraw) {
              setAccount((acc) => ({
                ...acc,
                demoBalance:
                  acc.type === 'demo'
                    ? +(acc.demoBalance + trade.amount).toFixed(2)
                    : acc.demoBalance,
                liveBalance:
                  acc.type === 'live'
                    ? +(acc.liveBalance + trade.amount).toFixed(2)
                    : acc.liveBalance,
              }));
              addToast(
                'info',
                'Trade Draw ⚖️',
                `Investment $${trade.amount} refunded on ${trade.assetName}`
              );
            } else {
              audio.playTradeLost();
              addToast(
                'error',
                'Trade Lost 📉',
                `-$${trade.amount.toFixed(2)} on ${trade.assetName} (Entry: ${trade.entryPrice.toFixed(4)}, Exit: ${exitPrice.toFixed(4)})`
              );
            }

            setTradeHistory((hist) => [
              {
                ...trade,
                currentPrice: exitPrice,
                status: isWon ? 'won' : isDraw ? 'draw' : 'lost',
                finalProfit: isWon ? trade.potentialProfit : isDraw ? 0 : -trade.amount,
              },
              ...hist,
            ]);
          });
        }

        return stillActive;
      });
    }, 250);

    return () => clearInterval(tradeTimer);
  }, []);

  // Place Trade handler
  const handlePlaceTrade = (direction: TradeDirection, amount: number, durationSeconds: number) => {
    const isDemo = account.type === 'demo';
    const currentBalance = isDemo ? account.demoBalance : account.liveBalance;

    if (currentBalance < amount) {
      addToast('error', 'Insufficient Funds', 'Please top up your balance or reset demo balance.');
      return;
    }

    setAccount((acc) => ({
      ...acc,
      demoBalance: isDemo ? +(acc.demoBalance - amount).toFixed(2) : acc.demoBalance,
      liveBalance: !isDemo ? +(acc.liveBalance - amount).toFixed(2) : acc.liveBalance,
    }));

    const latestPrice = candles[candles.length - 1]?.close || selectedAsset.basePrice;
    const payoutPercent = durationSeconds <= 60 ? selectedAsset.payout1m : selectedAsset.payout5m;
    const potentialProfit = +(amount * (payoutPercent / 100)).toFixed(2);

    const newTrade: ActiveTrade = {
      id: Math.random().toString(),
      assetId: selectedAsset.id,
      assetSymbol: selectedAsset.symbol,
      assetName: selectedAsset.name,
      direction,
      entryPrice: latestPrice,
      currentPrice: latestPrice,
      amount,
      payoutPercent,
      potentialProfit,
      startTime: Date.now(),
      durationSeconds,
      expiryTime: Date.now() + durationSeconds * 1000,
      remainingSeconds: durationSeconds,
      status: 'active',
    };

    setActiveTrades((prev) => [...prev, newTrade]);
    audio.playTradePlaced(direction);

    addToast(
      'success',
      'Trade Opened',
      `Trade opened with price: ${latestPrice} ${selectedAsset.name}`
    );
  };

  // Early sell cashout
  const handleSellEarly = (tradeId: string) => {
    const trade = activeTrades.find((t) => t.id === tradeId);
    if (!trade) return;

    const refund = +(trade.amount * 0.85).toFixed(2);
    setAccount((acc) => ({
      ...acc,
      demoBalance: acc.type === 'demo' ? +(acc.demoBalance + refund).toFixed(2) : acc.demoBalance,
      liveBalance: acc.type === 'live' ? +(acc.liveBalance + refund).toFixed(2) : acc.liveBalance,
    }));

    setActiveTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setTradeHistory((hist) => [
      {
        ...trade,
        status: 'sold',
        remainingSeconds: 0,
        finalProfit: -(trade.amount - refund),
      },
      ...hist,
    ]);

    audio.playClick();
    addToast('info', 'Trade Sold Early', `Sold for $${refund} on ${trade.assetName}`);
  };

  // Drawing Tools Handlers
  const handleAddDrawing = (drawing: DrawingItem) => {
    setDrawings((prev) => [...prev, drawing]);
    addToast('success', 'Drawing Placed', `${drawing.type} active on chart.`);
  };

  const handleUpdateDrawing = (updated: DrawingItem) => {
    setDrawings((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleRemoveDrawing = (id: string) => {
    setDrawings((prev) => prev.filter((d) => d.id !== id));
  };

  const handleClearAllDrawings = () => {
    setDrawings([]);
    addToast('info', 'Drawings Cleared', 'All drawings removed from chart.');
  };

  // Instantly place drawing from Drawings Drawer with nice default layout
  const handleSelectToolFromDrawer = (tool: DrawingToolType, color: string, lineWidth: number) => {
    const currentPrice = candles[candles.length - 1]?.close || selectedAsset.basePrice;
    const spread = currentPrice * 0.015 || 1;
    const now = Date.now();
    const timeStep = 60 * 1000;

    const sameTypeCount = drawings.filter((d) => d.type === tool).length + 1;

    const newDrawing: DrawingItem = {
      id: 'draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: tool,
      color,
      lineWidth,
      price: currentPrice + spread * 0.4,
      price2: currentPrice - spread * 0.4,
      price3: currentPrice - spread * 0.1,
      time: now - timeStep * 24,
      time2: now - timeStep * 6,
      time3: now - timeStep * 15,
      locked: false,
      visible: true,
      labelIndex: sameTypeCount,
    };

    handleAddDrawing(newDrawing);
  };

  // Indicator Handlers
  const handleAddIndicator = (type: IndicatorType) => {
    const newInd: IndicatorConfig = {
      id: Math.random().toString(),
      type,
      enabled: true,
      color: type === 'Alligator' ? '#0070f3' : type === 'Zig Zag' ? '#eab308' : '#00b074',
      lineWidth: 2,
      period: type === 'Bollinger Bands' ? 20 : 14,
      deviation: type === 'Bollinger Bands' ? 2 : 0.002,
    };
    setIndicators((prev) => [...prev, newInd]);
  };

  const handleUpdateIndicator = (updated: IndicatorConfig) => {
    setIndicators((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleRemoveIndicator = (id: string) => {
    setIndicators((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAllIndicators = () => {
    setIndicators([]);
  };

  // Sidebar navigation handler
  const handleSelectSidebarTab = (
    tab: 'trade' | 'drawings' | 'indicators' | 'settings' | 'account' | 'support'
  ) => {
    setSidebarTab(tab);

    if (tab === 'trade') {
      setIsDrawingsDrawerOpen(false);
      setIsIndicatorDrawerOpen(false);
      setIsSettingsDrawerOpen(false);
    } else if (tab === 'drawings') {
      setIsDrawingsDrawerOpen(true);
      setIsIndicatorDrawerOpen(false);
      setIsSettingsDrawerOpen(false);
    } else if (tab === 'indicators') {
      setIsIndicatorDrawerOpen(true);
      setIsDrawingsDrawerOpen(false);
      setIsSettingsDrawerOpen(false);
    } else if (tab === 'settings') {
      setIsSettingsDrawerOpen(true);
      setIsDrawingsDrawerOpen(false);
      setIsIndicatorDrawerOpen(false);
    } else if (tab === 'account') {
      setIsProfileModalOpen(true);
    } else if (tab === 'support') {
      setIsSupportModalOpen(true);
      audio.playClick();
    }
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audio.setSoundEnabled(nextState);
  };

  const handleChangeTimeframe = (newTf: Timeframe) => {
    setTimeframe(newTf);
    const tfSec = getTimeframeSeconds(newTf);
    const fresh = generateInitialCandles(selectedAsset, tfSec, 400);
    setCandles(fresh);
    addToast('info', 'Timeframe', `Switched to ${newTf} candle interval`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#10141d] text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Top Quotex Pro Header */}
      <Header
        account={account}
        onDepositClick={() => setIsDepositModalOpen(true)}
        onWithdrawClick={() => setIsWithdrawModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onResetDemoBalance={() => {
          setAccount((acc) => ({ ...acc, demoBalance: 10000.0 }));
          addToast('success', 'Demo Reset', 'Demo balance reset to $10,000.00');
        }}
        onSwitchAccountType={(type) => {
          setAccount((acc) => ({ ...acc, type }));
          addToast(
            'info',
            'Account Switched',
            `Switched to ${type === 'demo' ? 'Demo Account' : 'Live Real Account'}`
          );
        }}
      />

      {/* Main Platform Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={sidebarTab}
          onSelectTab={handleSelectSidebarTab}
          onOpenDeposit={() => setIsDepositModalOpen(true)}
          onOpenWithdrawal={() => setIsWithdrawModalOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          indicatorCount={indicators.length}
          drawingCount={drawings.length}
        />

        {/* Full-Height Vertical Market Sentiment Bar (Matching Quotex Video: Green/Red line moves live with candle) */}
        <div className="w-8 bg-[#131722] border-r border-[#202738] flex flex-col items-center justify-between py-2.5 select-none shrink-0 z-20">
          {/* Top Bullish Sentiment Badge */}
          <div
            title={`Buyers: ${marketSentiment.buyPercent}%`}
            className="flex flex-col items-center justify-center px-0.5 py-1 rounded bg-[#181d2a] border border-[#273248] text-center w-7 shadow-xs shrink-0"
          >
            <span className="text-[7.5px] text-[#00b074] font-black leading-none mb-0.5">▲</span>
            <span className="text-[9px] font-bold font-mono text-[#00b074] leading-none">
              {marketSentiment.buyPercent}%
            </span>
          </div>

          {/* Vertical Dynamic Sentiment Track */}
          <div className="w-1.5 flex-1 my-2 bg-[#1c2333] rounded-full overflow-hidden flex flex-col relative shadow-inner">
            <div
              className="w-full bg-[#00b074] transition-all duration-300 ease-out rounded-t-full shadow-[0_0_6px_rgba(0,176,116,0.35)]"
              style={{ height: `${marketSentiment.buyPercent}%` }}
              title={`Buyers: ${marketSentiment.buyPercent}%`}
            />
            <div
              className="w-full bg-[#ff4757] transition-all duration-300 ease-out rounded-b-full shadow-[0_0_6px_rgba(255,71,87,0.35)]"
              style={{ height: `${marketSentiment.sellPercent}%` }}
              title={`Sellers: ${marketSentiment.sellPercent}%`}
            />
          </div>

          {/* Bottom Bearish Sentiment Badge (Guaranteed visible, matching video) */}
          <div
            title={`Sellers: ${marketSentiment.sellPercent}%`}
            className="flex flex-col items-center justify-center px-0.5 py-1 rounded bg-[#181d2a] border border-[#273248] text-center w-7 shadow-xs shrink-0"
          >
            <span className="text-[9px] font-bold font-mono text-[#ff4757] leading-none mb-0.5">
              {marketSentiment.sellPercent}%
            </span>
            <span className="text-[7.5px] text-[#ff4757] font-black leading-none">▼</span>
          </div>
        </div>

        {/* Drawings Drawer (Slides out from left when Drawings icon is clicked) */}
        <DrawingsDrawer
          isOpen={isDrawingsDrawerOpen}
          onClose={() => {
            setIsDrawingsDrawerOpen(false);
            setSidebarTab('trade');
          }}
          onSelectTool={handleSelectToolFromDrawer}
          onClearAllDrawings={handleClearAllDrawings}
          drawingCount={drawings.length}
        />

        {/* Indicators Configuration Drawer */}
        <IndicatorDrawer
          isOpen={isIndicatorDrawerOpen}
          onClose={() => {
            setIsIndicatorDrawerOpen(false);
            setSidebarTab('trade');
          }}
          activeIndicators={indicators}
          onAddIndicator={handleAddIndicator}
          onUpdateIndicator={handleUpdateIndicator}
          onRemoveIndicator={handleRemoveIndicator}
          onClearAllIndicators={handleClearAllIndicators}
        />

        {/* Settings Drawer (Slides out from left when Settings cog is clicked) */}
        <SettingsDrawer
          isOpen={isSettingsDrawerOpen}
          onClose={() => {
            setIsSettingsDrawerOpen(false);
            setSidebarTab('trade');
          }}
          settings={platformSettings}
          onUpdateSettings={(newSettings) =>
            setPlatformSettings((prev) => ({ ...prev, ...newSettings }))
          }
        />

        {/* Central Candlestick Interactive Chart Canvas */}
        <ChartCanvas
          asset={selectedAsset}
          openAssets={openAssets}
          onSelectAsset={handleSelectAsset}
          onCloseAssetTab={handleCloseAssetTab}
          candles={candles}
          activeTrades={activeTrades}
          indicators={indicators}
          chartType={chartType}
          timeframe={timeframe}
          candleCountdown={candleCountdown}
          utcTime={utcTime}
          onOpenAssetModal={() => setIsAssetModalOpen(true)}
          onOpenIndicators={() => {
            setIsIndicatorDrawerOpen(true);
            setSidebarTab('indicators');
          }}
          onOpenDrawingModal={() => {
            setIsDrawingsDrawerOpen(true);
            setSidebarTab('drawings');
          }}
          onChangeChartType={setChartType}
          onChangeTimeframe={handleChangeTimeframe}
          onRemoveIndicator={handleRemoveIndicator}
          onUpdateIndicator={handleUpdateIndicator}
          activeDrawingTool={activeDrawingTool}
          onClearDrawingTool={() => setActiveDrawingTool(null)}
          drawings={drawings}
          onAddDrawing={handleAddDrawing}
          onUpdateDrawing={handleUpdateDrawing}
          onRemoveDrawing={handleRemoveDrawing}
          onClearAllDrawings={handleClearAllDrawings}
          settings={platformSettings}
        />

        {/* Right Trading Action Execution Panel */}
        <RightTradingPanel
          asset={selectedAsset}
          activeTrades={activeTrades}
          tradeHistory={tradeHistory}
          onPlaceTrade={handlePlaceTrade}
          onSellEarly={handleSellEarly}
          userBalance={account.type === 'demo' ? account.demoBalance : account.liveBalance}
        />
      </div>

      {/* Toast Notification Stack */}
      <div className="fixed top-16 right-72 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-xl border shadow-xl flex items-start gap-2.5 max-w-sm pointer-events-auto animate-in slide-in-from-top-2 duration-300 ${
              toast.type === 'success'
                ? 'bg-[#182622] border-[#00b074]/40 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-[#281a1d] border-[#ff4757]/40 text-rose-100'
                : 'bg-[#182030] border-[#0070f3]/40 text-blue-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#00b074]" />}
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-[#ff4757]" />}
              {toast.type === 'info' && <CheckCircle2 className="w-4 h-4 text-[#0070f3]" />}
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold leading-tight">{toast.title}</div>
              <div className="text-[11px] opacity-90 leading-tight mt-0.5">{toast.message}</div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modals & Dialogs */}
      <MarketSelectorModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDepositSuccess={(amt, bonus) => {
          const total = amt + bonus;
          setAccount((acc) => ({
            ...acc,
            liveBalance: +(acc.liveBalance + total).toFixed(2),
          }));
          addToast('success', 'Deposit Successful', `$${total.toFixed(2)} credited to your Live Account!`);
        }}
        accountType={account.type}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={account.type === 'demo' ? account.demoBalance : account.liveBalance}
        accountType={account.type}
        onWithdrawSuccess={(amt) => {
          setAccount((acc) => ({
            ...acc,
            liveBalance: acc.type === 'live' ? +(acc.liveBalance - amt).toFixed(2) : acc.liveBalance,
            demoBalance: acc.type === 'demo' ? +(acc.demoBalance - amt).toFixed(2) : acc.demoBalance,
          }));
          addToast('success', 'Withdrawal Processed', `$${amt.toFixed(2)} payout initiated to your wallet.`);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        account={account}
        tradeCount={tradeHistory.length}
        winCount={tradeHistory.filter((t) => t.status === 'won').length}
        onOpenDeposit={() => {
          setIsProfileModalOpen(false);
          setIsDepositModalOpen(true);
        }}
        onOpenWithdrawal={() => {
          setIsProfileModalOpen(false);
          setIsWithdrawModalOpen(true);
        }}
      />

      <SignalsModal
        isOpen={isSignalsModalOpen}
        onClose={() => setIsSignalsModalOpen(false)}
        currentAssetId={selectedAsset.id}
        onApplySignal={(assetId, dir, dur) => {
          const target = ASSETS_DATA.find((a) => a.id === assetId);
          if (target) {
            handleSelectAsset(target);
            handlePlaceTrade(dir, 19, dur || 60);
          }
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => {
          setIsSupportModalOpen(false);
          setSidebarTab('trade');
        }}
        userEmail={account.userEmail}
        accountId={account.accountId}
      />
    </div>
  );
}
