# blk

A collection of small JavaScript utilities for line processing and command generation.

## Tools

1. [entity](https://vchrombie.github.io/blk/entity/)

   Removes duplicate lines from input and outputs results in three formats (optionally sorted)

   - One-per-line
   - Comma-separated
   - Space-separated

   Can be used for `AppServer`/`CLIENT`/`hostname`.

2. [overdue](https://vchrombie.github.io/blk/overdue/)

   Generates commands to bounce the `AppServer` with an overdue status.

   ```log
   AppServer       climuse2tsl001   started at 2025-06-03 20:27:02 Asia/Tokyo, should have bounced by 2025-06-04 00:55:00 Asia/Tokyo
   ```

   ```shell
   CLIENT> restart AppServer climuse2tsl001 -r "Exceeded scheduled bounce time (should have bounced by 2025-06-04 00:55:00 Asia/Tokyo)"
   ```

3. [samsh (mobaxterm)](https://vchrombie.github.io/blk/samsh/mobaxterm/)

   Generates commands to bounce the `AppServer` with a specific status of a `CLIENT`. The inputs logs are from the sam shell in `mobaxterm` terminal.

   ```shell
   CLIENT> query AppServer*
   1/1   CLIENT AppServerWriteServer                   climusw2tsl001 104010
   * 0/1   CLIENT AppServerInfoWriteServer                   climusw2tsl003
   2/2   CLIENT AppServerPostingServer                     climusw2tsl001 60880 60890
   * 1/2   CLIENT AppServerPostingServer                     climusw2tsl003 118209
   * 2/1   CLIENT AppServerPostingServer_CLT                 climusw2tsl003 189987 118316
   * 2/1   CLIENT AppServerQueryServer                       climusw2tsl003 162195 80503
   1/1   CLIENT AppServerPresenceManagementWorker         climusw2tsl002 146534
   ```

   ```shell
   CLIENT> start AppServerInfoWriteServer climusw2tsl003 AppServerPostingServer climusw2tsl003 -r 'Instances fewer than expected'
   CLIENT> stop extra AppServerPostingServer_CLT climusw2tsl003 AppServerQueryServer climusw2tsl003 -r 'Instances exceed expected'
   ```

4. [samsh (prodmon)](https://vchrombie.github.io/blk/samsh/prodmon/)

   Generate commands to handle instance mismatches of `AppServer` and unreachable SAM on `hostname` on `CLIENT`. The input logs are from the ProdMon.

   ```text
   CLIENT1	AppServerService_BETA	Instance Mismatch (0/1)
   CLIENT1	AppServerService	Instance Mismatch (3/1)
   CLIENT2	AppServerPortalReportExportServer	Instance Mismatch (0/1)
   CLIENT3	AppServerPROD	Instance Mismatch (1/0)
   CLIENT3	AppServer_BLUE	Instance Mismatch (4/2)
   CLIENT2	AppServerAssetLoadServer	Instance Mismatch (0/7)
   CLIENT4	sam	SAM is unreachable on cli4bms002
   CLIENT4	sam	SAM is unreachable on cli4bms001
   ```

   ```bash
   /usr/local/bfm/etc/samsh.pl CLIENT4 -c 'agent-start cli4bms001 cli4bms002 -r Starting SAM'
   /usr/local/bfm/etc/samsh.pl -c 'start client=CLIENT2 name=AppServerAssetLoadServer,AppServerPortalReportExportServer -r Instances fewer than expected'
   /usr/local/bfm/etc/samsh.pl -c 'stop extra client=CLIENT3 name=AppServerPROD,AppServer_BLUE -r Instances exceed expected'
   /usr/local/bfm/etc/samsh.pl -c 'start client=CLIENT1 name=AppServerService_BETA -r Instances fewer than expected'
   /usr/local/bfm/etc/samsh.pl -c 'stop extra client=CLIENT1 name=AppServerService -r Instances exceed expected'
   ```
