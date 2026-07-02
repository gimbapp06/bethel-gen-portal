// Real-time disabled — using polling instead
// To re-enable, configure Pusher credentials in .env
const echo = {
  private: () => ({ listen: () => {}, stopListening: () => {} }),
  leave: () => {},
  channel: () => ({ listen: () => {}, stopListening: () => {} }),
}
export default echo
