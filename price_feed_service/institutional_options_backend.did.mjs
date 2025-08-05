export const idlFactory = ({ IDL }) => {
  const Trade = IDL.Record({
    'qty' : IDL.Float64,
    'account_id' : IDL.Text,
    'trade_id' : IDL.Text,
    'strategy' : IDL.Opt(IDL.Text),
    'side' : IDL.Text,
    'trade_type' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'price' : IDL.Float64,
    'position_type' : IDL.Opt(IDL.Text),
    'symbol' : IDL.Text,
  });
  const Position = IDL.Record({
    'qty' : IDL.Float64,
    'take_profit' : IDL.Float64,
    'strategy' : IDL.Text,
    'entry_date' : IDL.Text,
    'side' : IDL.Text,
    'stop_loss' : IDL.Float64,
    'entryPrice' : IDL.Float64,
    'position_type' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const RiskMetrics = IDL.Record({
    'theta' : IDL.Float64,
    'vega' : IDL.Float64,
    'var_95' : IDL.Float64,
    'gamma' : IDL.Float64,
    'delta' : IDL.Float64,
  });
  const PortfolioUpdate = IDL.Record({
    'account_id' : IDL.Text,
    'risk_metrics' : RiskMetrics,
    'total_pnl' : IDL.Float64,
    'total_value' : IDL.Float64,
    'positions' : IDL.Vec(Position),
    'last_update' : IDL.Nat64,
  });
  const TradeResult = IDL.Record({
    'updated_positions' : IDL.Vec(Position),
    'trade_id' : IDL.Text,
    'portfolio_metrics' : PortfolioUpdate,
    'success' : IDL.Bool,
  });
  const ExchangeData = IDL.Record({
    'ask' : IDL.Float64,
    'bid' : IDL.Float64,
    'last' : IDL.Float64,
    'volume' : IDL.Float64,
    'timestamp' : IDL.Nat64,
    'exchange' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const RiskLimits = IDL.Record({
    'max_position_size' : IDL.Float64,
    'max_daily_loss' : IDL.Float64,
    'var_limit' : IDL.Float64,
    'max_portfolio_delta' : IDL.Float64,
  });
  const InstitutionalAccount = IDL.Record({
    'aum' : IDL.Float64,
    'account_id' : IDL.Text,
    'risk_limits' : RiskLimits,
    'positions' : IDL.Vec(Position),
    'risk_profile' : IDL.Text,
    'account_name' : IDL.Text,
    'account_type' : IDL.Text,
  });
  const ProtectionStrategy = IDL.Record({
    'cost' : IDL.Float64,
    'implementation' : IDL.Text,
    'description' : IDL.Text,
    'strategy_name' : IDL.Text,
    'risk_reduction' : IDL.Float64,
  });
  const ProtectionAnalysis = IDL.Record({
    'account_id' : IDL.Text,
    'cost_benefit_analysis' : IDL.Text,
    'recommended_protection' : IDL.Vec(ProtectionStrategy),
    'current_risk' : IDL.Float64,
    'account_name' : IDL.Text,
  });
  const MarketSummary = IDL.Record({
    'change_24h' : IDL.Float64,
    'volume_24h' : IDL.Float64,
    'high_24h' : IDL.Float64,
    'timestamp' : IDL.Nat64,
    'low_24h' : IDL.Float64,
    'price' : IDL.Float64,
    'symbol' : IDL.Text,
  });
  const OptionContract = IDL.Record({
    'ask' : IDL.Float64,
    'bid' : IDL.Float64,
    'rho' : IDL.Float64,
    'option_type' : IDL.Text,
    'theta' : IDL.Float64,
    'strike' : IDL.Float64,
    'implied_volatility' : IDL.Float64,
    'last' : IDL.Float64,
    'vega' : IDL.Float64,
    'volume' : IDL.Float64,
    'gamma' : IDL.Float64,
    'underlying_price' : IDL.Float64,
    'expiry' : IDL.Nat32,
    'delta' : IDL.Float64,
    'open_interest' : IDL.Float64,
    'symbol' : IDL.Text,
  });
  const OptionChain = IDL.Record({
    'calls' : IDL.Vec(OptionContract),
    'puts' : IDL.Vec(OptionContract),
    'volatility_used' : IDL.Float64,
    'timestamp' : IDL.Nat64,
    'underlying_price' : IDL.Float64,
  });
  const RiskCheck = IDL.Record({
    'exceeded' : IDL.Bool,
    'violations' : IDL.Vec(IDL.Text),
    'risk_level' : IDL.Text,
  });
  const PortfolioRisk = IDL.Record({
    'greeks' : RiskMetrics,
    'recommendations' : IDL.Vec(IDL.Text),
    'risk_check' : RiskCheck,
    'last_update' : IDL.Nat64,
  });
  const PortfolioSummary = IDL.Record({
    'total_accounts' : IDL.Nat32,
    'total_pnl' : IDL.Float64,
    'risk_level' : IDL.Text,
    'total_value' : IDL.Float64,
    'total_positions' : IDL.Nat32,
  });
  const HealthResponse = IDL.Record({
    'market_data_available' : IDL.Bool,
    'status' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'connected_exchanges' : IDL.Nat32,
    'total_exchanges' : IDL.Nat32,
  });
  const PortfolioUpdateRequest = IDL.Record({
    'account_id' : IDL.Text,
    'positions' : IDL.Vec(Position),
  });
  return IDL.Service({
    'execute_institutional_trade' : IDL.Func(
        [Trade],
        [IDL.Variant({ 'Ok' : TradeResult, 'Err' : IDL.Text })],
        [],
      ),
    'execute_protection_strategy' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : TradeResult, 'Err' : IDL.Text })],
        [],
      ),
    'get_exchange_data' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : ExchangeData, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_exchange_portfolio_positions' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Vec(Position), 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_institutional_account' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : InstitutionalAccount, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_institutional_accounts' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(InstitutionalAccount),
            'Err' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'get_institutional_protection_analysis' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Vec(ProtectionAnalysis), 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_market_exchanges' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Vec(ExchangeData), 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_market_summary' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : MarketSummary, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_market_summary_by_symbol' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : MarketSummary, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_option_chain' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : OptionChain, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_option_chain_for_expiry' : IDL.Func(
        [IDL.Text, IDL.Nat32],
        [IDL.Variant({ 'Ok' : OptionChain, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_option_contract' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64, IDL.Nat32],
        [IDL.Variant({ 'Ok' : OptionContract, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_portfolio_risk' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : PortfolioRisk, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_portfolio_summary' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : PortfolioSummary, 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_protection_strategies' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Vec(ProtectionStrategy), 'Err' : IDL.Text })],
        ['query'],
      ),
    'get_trade_history' : IDL.Func(
        [IDL.Opt(IDL.Text)],
        [IDL.Variant({ 'Ok' : IDL.Vec(Trade), 'Err' : IDL.Text })],
        ['query'],
      ),
    'health' : IDL.Func([], [HealthResponse], ['query']),
    'update_exchange_data' : IDL.Func(
        [ExchangeData],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_market_data' : IDL.Func(
        [MarketSummary],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_portfolio' : IDL.Func(
        [PortfolioUpdateRequest],
        [IDL.Variant({ 'Ok' : PortfolioUpdate, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
