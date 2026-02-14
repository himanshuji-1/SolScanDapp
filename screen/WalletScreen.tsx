import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
  SafeAreaViewBase,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  Swap: undefined;
};

const RPC = "https://api.mainnet-beta.solana.com";

const rpc = async (method: string, params: any[]) => {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

const getBalance = async (addr: string) => {
  const result = await rpc("getBalance", [addr]);
  return result.value / 1_000_000_000;
};

const getTokens = async (addr: string) => {
  const result = await rpc("getTokenAccountsByOwner", [
    addr,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);
  return (result.value || [])
    .map((a: any) => ({
      mint: a.account.data.parsed.info.mint,
      amount: a.account.data.parsed.info.tokenAmount.uiAmount,
    }))
    .filter((t: any) => t.amount > 0);
};


const getTxns = async (addr: string) => {
  const sigs = await rpc("getSignaturesForAddress", [addr, { limit: 10 }]);
  return sigs.map((s: any) => ({
    sig: s.signature,
    time: s.blockTime,
    ok: !s.err,
  }));
};

const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`;

const timeAgo = (ts: number) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};


export function WalletScreen() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const search = async () => {
  const addr = address.trim();
  if (!addr) return Alert.alert("Enter a wallet address");

  setLoading(true);
  try {
    const [bal, tok, tx] = await Promise.all([
      getBalance(addr),
      getTokens(addr),
      getTxns(addr),
    ]);
    setBalance(bal);
    setTokens(tok);
    setTxns(tx);
  } catch (e: any) {
    Alert.alert("Error", e.message);
  }
  setLoading(false);
};
  return (
   
    <ScrollView>
      <View style={{backgroundColor: "Black", paddingHorizontal:20, paddingVertical:45, minHeight: "100%"}}>
        <TextInput
  style={s.input}
  placeholder="Solana wallet address..."
  placeholderTextColor="#555"
  value={address}
  onChangeText={setAddress}
  autoCapitalize="none"
  autoCorrect={false}
/>
<TouchableOpacity
  style={{
    backgroundColor: "#14F195",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  }}
  onPress={() => navigation.navigate("Swap")}
>
  <Text style={{ color: "#000", fontWeight: "bold" }}>
    Go to Swap
  </Text>
</TouchableOpacity>

<TouchableOpacity style={s.btn} onPress={search} disabled={loading}>
  {loading ? (
    <ActivityIndicator color="#000" />
  ) : (
    <Text style={s.btnText}>Search</Text>
  )}
</TouchableOpacity>

{balance !== null && (
  <View style={s.card}>
    <Text style={s.label}>SOL Balance</Text>
    <Text style={s.balance}>{balance.toFixed(4)}</Text>
    <Text style={s.sol}>SOL</Text>
    <Text style={s.addr}>{short(address.trim(), 6)}</Text>
  </View>
)}
 {/* Flatlist is a performant way to render lists in React Native. It only renders what's on screen and recycles views as you scroll.
View is a container component in React Native, similar to a div in web. It can have styles and layout properties.
Text is a component for displaying text in React Native. It can be styled and nested. */}


<FlatList
  data={tokens}
  keyExtractor={(t) => t.mint}
  scrollEnabled={false}
  renderItem={({ item }) => (
    <View style={s.row}>
      <Text style={s.mint}>{short(item.mint, 6)}</Text>
      <Text style={s.amount}>{item.amount}</Text>
    </View>
  )}
/>
<Text style={[s.label, { marginTop: 12 }]}>Recent Transactions</Text>
<FlatList
  data={txns}
  keyExtractor={(t) => t.sig}
  scrollEnabled={false}
  renderItem={({ item }) => (
    <View style={s.row}>
      <Text style={{ color: item.ok ? "#14F195" : "#f14", fontSize: 12 }}>
        {timeAgo(item.time)}
      </Text>
      <Text style={{ color: item.ok ? "#14F195" : "#f14", fontSize: 12 }}>
        {item.ok ? "Success" : "Failed"}
      </Text> 
      </View>
   )}
/>
  {/* <TouchableOpacity
  onPress={() => Linking.openURL(`https://solscan.io/tx/${item.sig}`)}
> </TouchableOpacity> */}
      </View>
    </ScrollView>
   

  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0e0e35" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f0f23",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  btn: {
  flex: 1,
  backgroundColor: "#14F195",  // camelCase!
  padding: 14,                 // no 'px'!
  borderRadius: 12,            // camelCase!
  alignItems: "center",        // camelCase!
},
  btnText: { color: "#000", fontWeight: "bold" },
  input: {
    backgroundColor: "#0f0f23",
    color: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0f0f23",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  label: { color: "#555", fontSize: 12, marginBottom: 4 },
  balance: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  sol: { color: "#14F195", fontSize: 16, marginTop: -4 },
  addr: { color: "#555", fontSize: 10, marginTop: 8 },

mint: { color: "#fff", fontSize: 12 },
amount: { color: "#14F195", fontWeight: "bold" },
});

// Promise.all is a JavaScript function that takes an 
// array of promises and returns a new promise that resolves when
//  all the input promises have resolved, or rejects if any of 
//  the input promises reject. It allows you to run multiple asynchronous
//   operations in parallel and wait for all of them to complete before proceeding.

// In the context of the provided code, Promise.all is used to fetch the balance, 
// tokens, and transactions for a given Solana wallet address simultaneously. This
//  means that the app can retrieve all the necessary data in one go, improving 
//  performance and user experience by reducing the total waiting time.