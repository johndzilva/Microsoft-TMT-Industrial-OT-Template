# OT Product and System Threat Model Template (IEC 62443)

A Microsoft Threat Modeling Tool (TMT) template for **operational technology (OT)**: industrial control system products and systems. It adds 80 OT stencils, 100 OT-specific STRIDE threats and IEC 62443-aligned properties on top of TMT's own built-in stencils, so a data flow diagram of a PLC, a SCADA system or a whole control network produces OT threats instead of IT web-application threats.

Each threat is mapped to **MITRE ATT&CK for ICS (v20)**, **IEC 62443-4-2 / 3-3 / 4-1** requirements, a foundational requirement (FR1-FR7), the lowest security level where it applies, and an OT consequence. Each threat also carries risk fields (likelihood, impact, rating, treatment) for a 5x5 risk matrix.

- **Use it for:** IEC 62443-4-2 component threat models (embedded device, host device, network device, software application) and IEC 62443-3-3 system / solution threat models.
- **Not for:** plant-level IEC 62443-3-2 risk assessments (zones and conduits for a whole site). Use a separate plant template for those.
- **Tested with:** Microsoft Threat Modeling Tool 2016. The template editor reports 0 validation messages and new models open with "No issues found".

## Quick start

1. Install [Microsoft Threat Modeling Tool](https://aka.ms/threatmodelingtool).
2. Open TMT. Under **Template For New Models**, click **Browse** and select `OT Product and System Threat Template (IEC 62443).tb7`.
3. Click **Create A Model**. The OT stencils appear in the Stencils pane next to Microsoft's.
4. Draw the system, set the element and flow properties (see below), then open **View > Analysis View** to see the generated threats.
5. Use **Reports > Create Full Report** for the threat report.

To look at or edit the template itself, use **Open Template**.

To see a finished model first, open `examples/Water Treatment Plant - OT Threat Model.tm7` with **Open A Model**.

## How to model

**Component model (IEC 62443-4-2)**
1. Draw a **Component or Device Boundary** around your product.
2. Inside it, split the product into its functions: for example a PLC runtime, its web interface, the firmware update service, the key store and the firmware image. Separate them with a **Process or Privilege Boundary** where relevant.
3. Outside it, add the people and systems the product talks to.
4. Every interface that crosses the device boundary receives the device-level threats (firmware integrity, default credentials, protocol fuzzing, supply chain and so on).

**System model (IEC 62443-3-3)**
1. Draw an **IEC 62443 Security Zone** per zone, plus a **Safety Zone - SIS**, an **Industrial DMZ Level 3.5** and an **Enterprise or IT Zone**. Set the Purdue level and zone SL-T on each.
2. Use **IEC 62443 Conduit** and **Internet or Untrusted Network Boundary** lines for the paths between zones.
3. Pick the stencil that matches each device. Its IEC 62443-4-2 component type (EDR, HDR, NDR, SAR) is fixed by the stencil.

## Set the properties: they decide which threats appear

Every OT property starts at **Unknown**, which generates the threat. Set a property to **No** to remove threats that do not apply. With everything left at Unknown, expect about 20 threats per data flow.

| Element | Properties |
|---|---|
| Components (processes) | IEC 62443-4-2 component type (fixed by stencil), SL-T, safety-related function, reachable from outside its zone, web interface, user accounts, stores secrets, field-updatable, third-party components, debug ports, physically exposed, wireless interface, removable media, legacy OS |
| Data flows | **Protocol Security in Use** (most important: Unknown, None, Integrity only, Integrity and encryption), carries control commands, carries safety data, carries credentials, physical medium, **Generate Threats for this Flow** (set to No to silence a flow) |
| Interactors | Authenticates itself, trust level |
| Data stores | Contains sensitive data, contains control-critical data |
| Zone boundaries | Purdue / ISA-95 level, zone SL-T |

Microsoft's stencils keep their own properties. HTTPS and IPsec flows are marked as integrity and confidentiality protected, so they skip the in-transit threats.

Device-level threats only appear on exposed interfaces: flows that cross a trust boundary or come from an external interactor. This avoids repeating them on every internal flow.

## Analyse and score

1. In **Analysis View**, set each threat's status: Not Started, Needs Investigation, Not Applicable or Mitigated.
2. Fill in **Likelihood (1-5)**, **Impact (1-5)**, **Risk Rating** and **Risk Treatment**, then record the implemented mitigation and the verification evidence (IEC 62443-4-1 SVV).

Risk rating (5x5): **Critical 20-25, High 12-19, Medium 6-11, Low 1-5**.

## Example: water treatment plant

`examples/Water Treatment Plant - OT Threat Model.tm7` is a complete model of a municipal water treatment plant, built with this template and saved by TMT 2016. Open it with **Open A Model**: it contains **300 generated threats** across 17 data flows.

| Zone (Purdue level, SL-T) | Elements |
|---|---|
| Enterprise IT Zone (Level 4, SL 1) | Corporate IT and Billing |
| Industrial DMZ (Level 3.5, SL 2) | Remote Access Gateway, DMZ Historian Replica |
| SCADA Zone (Level 2-3, SL 2) | SCADA Server, Control Room HMI (legacy OS), Engineering Workstation, Process Historian Database |
| Treatment Process Zone (Level 1-0, SL 2) | Chemical Dosing PLC (web interface), Filtration PLC, Chlorine Analyzer, Dosing Pump Drive, Water Treatment Process |
| Remote Lift Stations (Level 1, SL 1) | Lift Station Cellular Router, Lift Station RTU (physically exposed) |
| Outside the zones | Vendor Remote Support (over the Internet), Plant Operator, USB Media and Contractor Laptop |

Properties are set as a real assessment would set them, which is what narrows the threats:
- Modbus TCP, DNP3, HART, EtherNet/IP and the vendor engineering protocol have **Protocol Security = None**; the VPN, RDP and historian replication flows use **Integrity and encryption**.
- Flows that carry commands or setpoints have **Carries Control Commands = Yes**; the lift-station telemetry runs over **Cellular** and crosses an Internet boundary, as does the vendor VPN.
- Component capabilities (web interface, user accounts, removable media, physical exposure, legacy OS) are set per device, so, for example, only the HMI gets the legacy-platform threat and only the lift-station equipment gets physical tampering.

The busiest interfaces are the ones an assessor would expect: PLC programming from the engineering workstation (35 threats), SCADA dosing setpoints over Modbus (33), filtration control (30), cellular telemetry to the lift stations (29) and the operator console (28).

## Stencils

80 OT stencils plus Microsoft's 52 built-in stencils (OS Process, Web Server, Web Application, SQL Database, HTTPS, IPsec, Internet Boundary and others), 132 in total. Component stencils are prefixed with their IEC 62443-4-2 type. Icon colour shows the family: blue embedded device, teal host device, orange network device, green software application, slate interactor, purple data store, brown protocol, red boundary.

| Group | Count | Stencils |
|---|---|---|
| Embedded devices (EDR) | 7 | EDR PLC or Process Controller, EDR Safety Controller SIS SIL rated, EDR RTU or Remote Field Controller, EDR IED or Protection Relay, EDR Smart Field Device sensor actuator drive analyzer, EDR IIoT Device or Edge Sensor, EDR Safety IO Module |
| Host devices (HDR) | 3 | HDR Industrial PC or Panel PC, HDR OT Server for SCADA DCS or Historian, HDR Engineering Workstation |
| Network devices (NDR) | 6 | NDR Industrial Firewall or Conduit Device, NDR Managed Industrial Switch, NDR Router Cellular or WAN Gateway, NDR Industrial Wireless AP or Wireless Gateway, NDR Remote Access Gateway or Jump Host, NDR Unidirectional Gateway or Data Diode |
| Software applications (SAR) | 12 | SAR HMI or Operator Application, SAR SCADA or DCS Server Application, SAR Engineering or Configuration Tool, SAR Historian Application, SAR OPC UA Server or Protocol Gateway Software, SAR Embedded Web Server or Device Management UI, SAR Edge Computing Platform or Container Runtime, SAR Firmware or Software Update Service, SAR Identity or Authentication Service AD LDAP RADIUS, SAR Security Monitoring or Log Collector SIEM IDS Syslog, SAR Backup and Recovery Service, SAR Asset or Device Management Application |
| External interactors | 12 | Operator, Control or Maintenance Engineer, System or Security Administrator, Vendor or Remote Support, System Integrator or Contractor, Enterprise IT System ERP MES IT network, Vendor or Cloud Service, Physical Process or Equipment, Third Party or Legacy Field Device, Removable Media or Transient Device, Time Source NTP PTP GNSS, PKI or Certificate Authority |
| Data stores | 8 | Control Logic or Project Files, Device Configuration and Parameters, Recipes or Batch Data, Firmware or Software Image, Credential or Key Store TPM secure element keystore, Historian Database, Security or Audit Log, Backup Archive |
| Data flows (protocols) | 22 | Modbus TCP, Modbus RTU Serial RS232 RS485, DNP3, IEC 104 Telecontrol, IEC 61850 MMS, IEC 61850 GOOSE or Sampled Values, EtherNet IP CIP, PROFINET, Safety Protocol PROFIsafe CIP Safety FSoE, Vendor Engineering Protocol, OPC UA, OPC Classic DA HDA AE over DCOM, MQTT, HTTP or HTTPS Web REST, Remote Desktop or Remote Shell RDP VNC SSH, SNMP or Network Management, Syslog or Security Event Forwarding, Time Synchronisation NTP PTP, Wireless Link WiFi WirelessHART ISA100 BT, File or Firmware Transfer FTP TFTP SMB USB, HART 4 to 20 mA with HART, BACnet |
| Zone (border) boundaries | 6 | IEC 62443 Security Zone, Safety Zone SIS, Industrial DMZ Level 3.5, Component or Device Boundary, Enterprise or IT Zone, Vendor or Cloud Boundary |
| Line boundaries | 4 | IEC 62443 Conduit, Internet or Untrusted Network Boundary, Physical Access Boundary, Process or Privilege Boundary |

## Threat properties

| Property | Content |
|---|---|
| Priority | High / Medium / Low |
| Possible Mitigation(s) | Recommended controls |
| IEC 62443-4-1 Practice | SR, SD, SI, SVV, DM, SUM, SG or SM |
| MITRE ATTACK for ICS v20 | Related techniques (v20 IDs, e.g. T1692.001) |
| IEC 62443 Requirement(s) | 4-2 CR / 3-3 SR / 4-1 references; the first belongs to the stated FR |
| IEC 62443 Foundational Requirement | FR1 to FR7 |
| Relevant from SL | Lowest SL-T at which countermeasures are normally required |
| OT Consequence | Safety, environment, equipment, production, view or control, IP |
| Likelihood (1-5), Impact (1-5), Risk Rating, Risk Treatment | 5x5 risk assessment |
| Implemented Mitigation(s), Verification Evidence, Owner | Treatment record |

## Threat catalogue

100 threats. In TMT the titles name the actual source and target elements.

| ID | STRIDE | Threat | Priority | From SL | ATT&CK for ICS (first) | IEC 62443 (primary) |
|---|---|---|---|---|---|---|
| OT-S01 | Spoofing | Spoofing of source across a zone / trust boundary | High | SL 2 | T0849 Masquerading | 4-2 CR 1.2 |
| OT-S02 | Spoofing | Rogue master or rogue device on the fieldbus to target | High | SL 2 | T0848 Rogue Master | 4-2 CR 1.2 |
| OT-S03 | Spoofing | Session hijacking on the target web interface | Medium | SL 2 | T0859 Valid Accounts | 4-2 CR 3.8 |
| OT-S04 | Spoofing | Default, shared or hard-coded credentials on target | High | SL 1 | T1694.001 Insecure Credentials: Default Credentials | 4-2 CR 1.1 |
| OT-S05 | Spoofing | Brute-force or password guessing against target | Medium | SL 1 | T0859 Valid Accounts | 4-2 CR 1.11 |
| OT-S06 | Spoofing | Stolen credentials used for remote access to target | High | SL 2 | T0822 External Remote Services | 3-3 SR 1.13 |
| OT-S07 | Spoofing | Rogue access point or rogue wireless device connecting to target | High | SL 2 | T0860 Wireless Compromise | 3-3 SR 1.6 |
| OT-S08 | Spoofing | Impersonation of source at target | High | SL 1 | T0859 Valid Accounts | 4-2 CR 1.1 |
| OT-S09 | Spoofing | Time source spoofing affecting target | Medium | SL 2 | T0849 Masquerading | 4-2 CR 2.11 |
| OT-S10 | Spoofing | Certificate or PKI misuse affecting target | Medium | SL 2 | T0849 Masquerading | 4-2 CR 1.8 |
| OT-S11 | Spoofing | OPC UA trust misconfiguration on target | Medium | SL 1 | T0849 Masquerading | 4-2 CR 1.2 |
| OT-S12 | Spoofing | Code-signing key for software delivered via target stolen or misused | High | SL 2 | T0862 Supply Chain Compromise | 4-2 CR 1.9 |
| OT-S13 | Spoofing | Dormant, orphaned or unrevoked accounts on target | Medium | SL 1 | T0859 Valid Accounts | 4-2 CR 1.4 |
| OT-T01 | Tampering | Adversary-in-the-middle tampering of source to target traffic | High | SL 2 | T0830 Adversary-in-the-Middle | 4-2 CR 3.1 |
| OT-T02 | Tampering | Replay or injection of control commands to target | High | SL 2 | T1692.001 Unauthorized Message: Command Message | 4-2 CR 3.1 |
| OT-T03 | Tampering | Unauthorized program / logic download to target | High | SL 1 | T0843 Program Download | 4-2 CR 2.1 |
| OT-T04 | Tampering | Setpoint or parameter on target changed to unsafe values | High | SL 1 | T0836 Modify Parameter | 4-2 CR 3.5 |
| OT-T05 | Tampering | Manipulation of I/O image or forcing of points on target | Medium | SL 2 | T0835 Manipulate I/O Image | 4-2 CR 2.1 |
| OT-T06 | Tampering | Malicious or modified firmware loaded on target | High | SL 1 | T1693.002 Modify Firmware: Module Firmware | 4-2 CR 3.4 |
| OT-T07 | Tampering | Boot process or runtime integrity of target bypassed | Medium | SL 2 | T1693.001 Modify Firmware: System Firmware | 4-2 EDR 3.14 |
| OT-T08 | Tampering | Physical tampering with target | Medium | SL 2 | T1693.002 Modify Firmware: Module Firmware (via physical access) | 4-2 EDR 3.11 |
| OT-T09 | Tampering | Spoofed measurement or status reported from source | High | SL 2 | T1692.002 Unauthorized Message: Reporting Message | 4-2 CR 3.1 |
| OT-T10 | Tampering | Unauthorized modification of safety logic or configuration on target | High | SL 3 | T0880 Loss of Safety | 4-2 CR 3.4 |
| OT-T11 | Tampering | Deliberate manipulation of safety communication to target | High | SL 3 | T0830 Adversary-in-the-Middle | 4-2 CR 3.1 |
| OT-T12 | Tampering | Manipulation of view on target | High | SL 2 | T0832 Manipulation of View | 4-2 CR 3.1 |
| OT-T13 | Tampering | Alarm suppression or modification on target | Medium | SL 2 | T0878 Alarm Suppression | 4-2 CR 2.1 |
| OT-T14 | Tampering | Malware execution on target | High | SL 1 | T0863 User Execution | 4-2 HDR 3.2 |
| OT-T15 | Tampering | Project file infection via target | High | SL 2 | T0873 Project File Infection | 4-2 CR 3.4 |
| OT-T16 | Tampering | Mobile code or script injection in target | Medium | SL 1 | T1701 Command and Scripting Interpreter | 4-2 SAR 2.4 |
| OT-T17 | Tampering | Vulnerable or compromised third-party component in target | High | SL 1 | T0862 Supply Chain Compromise | 4-2 CR 7.8 |
| OT-T18 | Tampering | Counterfeit device or tampering of target before delivery | Medium | SL 2 | T0862 Supply Chain Compromise | 4-2 EDR 3.12 |
| OT-T19 | Tampering | Security configuration of target disabled or weakened | Medium | SL 2 | T0872 Indicator Removal on Host | 4-2 CR 3.3 |
| OT-T20 | Tampering | Layer 2 attacks via target (VLAN hopping, ARP spoofing, port mirroring) | Medium | SL 2 | T0830 Adversary-in-the-Middle | 4-2 CR 7.6 |
| OT-T21 | Tampering | Compromised update channel between source and target | High | SL 1 | T0862 Supply Chain Compromise | 4-2 CR 3.4 |
| OT-T22 | Tampering | Malware introduced into target via removable media or transient device | High | SL 1 | T0847 Replication Through Removable Media | 4-2 EDR 3.2 |
| OT-T23 | Tampering | Tampering with control-critical data in target | High | SL 1 | T0836 Modify Parameter | 4-2 CR 3.4 |
| OT-T24 | Tampering | Tampering with firmware images in target | High | SL 1 | T1693.001 Modify Firmware: System Firmware | 4-2 CR 3.4 |
| OT-T25 | Tampering | Cloud-originated commands or configuration to target | High | SL 2 | T1692.001 Unauthorized Message: Command Message | 3-3 SR 5.2 |
| OT-T26 | Tampering | Physical inputs to target manipulated at the process | Medium | SL 2 | T1692.002 Unauthorized Message: Reporting Message | 4-2 CR 3.5 |
| OT-T27 | Tampering | Mass configuration change through target | Medium | SL 2 | T1693.002 Modify Firmware: Module Firmware | 4-2 CR 2.1 |
| OT-T28 | Tampering | Malicious code inserted into target during development or build | High | SL 1 | T0862 Supply Chain Compromise | 4-2 CR 3.4 |
| OT-T29 | Tampering | Rogue publisher or subscriber on the source to target messaging channel | High | SL 2 | T0869.002 Standard Application Layer Protocol: Publish/Subscribe Protocols | 4-2 CR 1.2 |
| OT-R01 | Repudiation | Security-relevant actions on target not audited | Medium | SL 1 | T0872 Indicator Removal on Host | 4-2 CR 2.8 |
| OT-R02 | Repudiation | Actions by source on target cannot be attributed | Medium | SL 1 | T0859 Valid Accounts | 4-2 CR 2.8 |
| OT-R03 | Repudiation | Audit records in target modified or deleted | High | SL 2 | T0872 Indicator Removal on Host | 4-2 CR 3.9 |
| OT-R04 | Repudiation | Security events from source do not reach target | Medium | SL 2 | T0872 Indicator Removal on Host | 4-2 CR 6.1 |
| OT-R05 | Repudiation | Logic or configuration changes on target cannot be proven or reconstructed | Medium | SL 2 | T0889 Modify Program | 4-2 CR 2.12 |
| OT-R06 | Repudiation | Local audit trail on target lost, overwritten or cleared | Medium | SL 2 | T0872 Indicator Removal on Host | 4-2 CR 3.9 |
| OT-R07 | Repudiation | Operator actions by source on target not journaled | Medium | SL 1 | T0872 Indicator Removal on Host | 4-2 CR 2.8 |
| OT-I01 | Information disclosure | Sniffing of operational data between source and target | Medium | SL 2 | T0842 Network Sniffing | 4-2 CR 4.1 |
| OT-I02 | Information disclosure | Credentials or keys exposed on the source to target flow | High | SL 1 | T0842 Network Sniffing | 4-2 CR 4.1 |
| OT-I03 | Information disclosure | Reconnaissance of target (device fingerprinting, enumeration) | Low | SL 2 | T0888 Remote System Information Discovery | 4-2 CR 7.7 |
| OT-I04 | Information disclosure | Program upload / theft of control logic from target | Medium | SL 2 | T0845 Program Upload | 4-2 CR 4.1 |
| OT-I05 | Information disclosure | Extraction of keys or credentials from target | High | SL 2 | T1694.002 Insecure Credentials: Hardcoded Credentials | 4-2 CR 4.1 |
| OT-I06 | Information disclosure | Theft of engineering / operational information from target | Medium | SL 2 | T0882 Theft of Operational Information | 4-2 CR 4.1 |
| OT-I07 | Information disclosure | Verbose errors or diagnostics disclose internals of target | Low | SL 1 | T0888 Remote System Information Discovery | 4-2 CR 3.7 |
| OT-I08 | Information disclosure | Weak or obsolete cryptography in target | Medium | SL 1 | T0842 Network Sniffing | 4-2 CR 4.3 |
| OT-I09 | Information disclosure | Management credentials or configuration of target disclosed | Medium | SL 1 | T0842 Network Sniffing | 4-2 CR 4.1 |
| OT-I10 | Information disclosure | Wireless sniffing of traffic to target | Medium | SL 1 | T0887 Wireless Sniffing | 4-2 CR 4.1 |
| OT-I11 | Information disclosure | Disclosure of credentials or keys from target | High | SL 1 | T1694.002 Insecure Credentials: Hardcoded Credentials | 4-2 CR 4.1 |
| OT-I12 | Information disclosure | Sensitive data in target recoverable after decommissioning | Low | SL 2 | T0893 Data from Local System | 4-2 CR 4.2 |
| OT-I13 | Information disclosure | Bulk exfiltration of data from target | Medium | SL 2 | T0811 Data from Information Repositories | 4-2 CR 4.1 |
| OT-I14 | Information disclosure | Operational data exposed in vendor / cloud service target | Medium | SL 1 | T0882 Theft of Operational Information | 4-2 CR 4.1 |
| OT-I15 | Information disclosure | Process state and I/O image read from target by an unauthorised client | Medium | SL 2 | T0801 Monitor Process State | 4-2 CR 2.1 |
| OT-D01 | Denial of service | Network flooding of target from another zone | Medium | SL 1 | T0814 Denial of Service | 4-2 CR 7.1 |
| OT-D02 | Denial of service | Remote restart, shutdown or stop of target | High | SL 1 | T0816 Device Restart/Shutdown | 4-2 CR 7.1 |
| OT-D03 | Denial of service | target outputs not driven to a safe state when attacked or failing | High | SL 1 | T0813 Denial of Control | 4-2 CR 3.6 |
| OT-D04 | Denial of service | Network load disturbs the scan cycle of target | Medium | SL 1 | T0814 Denial of Service | 4-2 CR 7.1 |
| OT-D05 | Denial of service | Loss of view on target | High | SL 1 | T0815 Denial of View | 4-2 CR 7.1 |
| OT-D06 | Denial of service | Ransomware or destructive malware disables target | High | SL 1 | T0809 Data Destruction | 4-2 CR 7.3 |
| OT-D07 | Denial of service | Failed or malicious update leaves target unavailable | Medium | SL 1 | T0826 Loss of Availability | 4-2 CR 7.4 |
| OT-D08 | Denial of service | Denial of service of network device target | Medium | SL 1 | T0814 Denial of Service | 4-2 CR 7.1 |
| OT-D09 | Denial of service | RF jamming or de-authentication of target | Medium | SL 1 | T0814 Denial of Service | 4-2 CR 7.1 |
| OT-D10 | Denial of service | Audit storage of target exhausted | Medium | SL 1 | T0872 Indicator Removal on Host | 4-2 CR 2.9 |
| OT-D11 | Denial of service | Backups in target unavailable, encrypted or corrupted | High | SL 1 | T0809 Data Destruction | 4-2 CR 7.3 |
| OT-D12 | Denial of service | Identity service unavailable blocks operators on target | Medium | SL 1 | T0826 Loss of Availability | 4-2 CR 7.1 (essential functions) |
| OT-D13 | Denial of service | Active scanning by source disrupts target | Medium | SL 1 | T0814 Denial of Service | 4-2 CR 7.1 |
| OT-D14 | Denial of service | Command, trip or alarm messages between source and target blocked | High | SL 2 | T1691.001 Block Operational Technology Message: Command Message | 4-2 CR 7.1 |
| OT-E01 | Elevation of privilege | Non-essential services on target reachable across the boundary | Medium | SL 1 | T0866 Exploitation of Remote Services | 4-2 CR 7.7 |
| OT-E02 | Elevation of privilege | Unauthorized change of operating mode on target | High | SL 1 | T0858 Change Operating Mode | 4-2 CR 2.1 |
| OT-E03 | Elevation of privilege | Debug or service interface on target gives privileged access | High | SL 1 | T1693.002 Modify Firmware: Module Firmware | 4-2 EDR 2.13 |
| OT-E04 | Elevation of privilege | Bypass, override or inhibit of safety function on target | High | SL 3 | T0858 Change Operating Mode | 4-2 CR 2.1 |
| OT-E05 | Elevation of privilege | Compromise of the control network reaches safety function target | High | SL 3 | T0880 Loss of Safety | 3-3 SR 5.1 |
| OT-E06 | Elevation of privilege | Missing or weak role-based access control on target | High | SL 1 | T0859 Valid Accounts | 4-2 CR 2.1 |
| OT-E07 | Elevation of privilege | Exploitation of unpatched / legacy platform of target | High | SL 1 | T0866 Exploitation of Remote Services | 4-2 HDR 3.10 |
| OT-E08 | Elevation of privilege | Compromised source used to control target | High | SL 2 | T0843 Program Download | 4-2 CR 1.1 |
| OT-E09 | Elevation of privilege | Web application vulnerabilities in target | High | SL 1 | T0819 Exploit Public-Facing Application | 4-2 CR 3.5 |
| OT-E10 | Elevation of privilege | Kiosk / HMI break-out to the underlying OS of target | Medium | SL 1 | T0823 Graphical User Interface | 4-2 CR 2.1 |
| OT-E11 | Elevation of privilege | Memory corruption or parser flaw in the communication stack of target | High | SL 1 | T0866 Exploitation of Remote Services | 4-2 CR 3.5 |
| OT-E12 | Elevation of privilege | Insecure default configuration of target | Medium | SL 1 | T1694.001 Insecure Credentials: Default Credentials | 4-2 CR 7.6 |
| OT-E13 | Elevation of privilege | Zone boundary bypass or misconfiguration of target | High | SL 1 | T0884 Connection Proxy | 4-2 NDR 5.2 |
| OT-E14 | Elevation of privilege | Unsupervised or persistent third-party access to target | High | SL 2 | T0822 External Remote Services | 4-2 CR 2.6 |
| OT-E15 | Elevation of privilege | target exposed to the Internet or an untrusted network | High | SL 1 | T0883 Internet Accessible Device | 3-3 SR 5.2 |
| OT-E16 | Elevation of privilege | Insider misuse of privileged access by source | Medium | SL 2 | T0859 Valid Accounts | 4-2 CR 2.1 |
| OT-E17 | Elevation of privilege | Pivot from enterprise IT (source) into target | High | SL 1 | T0866 Exploitation of Remote Services | 3-3 SR 5.1 |
| OT-E18 | Elevation of privilege | Direct connection from source to controller target | High | SL 1 | T0883 Internet Accessible Device | 3-3 SR 5.1 |
| OT-E19 | Elevation of privilege | Container escape or app isolation failure on target | High | SL 2 | T0890 Exploitation for Privilege Escalation | 3-3 SR 5.4 |
| OT-E20 | Elevation of privilege | target bridges insecure legacy traffic into a secured network | Medium | SL 2 | T0884 Connection Proxy | 3-3 SR 5.2 |
| OT-E21 | Elevation of privilege | Compromise of identity service target gives access to all OT assets | High | SL 2 | T0859 Valid Accounts | 4-2 CR 1.3 |
| OT-E22 | Elevation of privilege | Attacker tools staged on target to reach the control network | High | SL 2 | T0867 Lateral Tool Transfer | 4-2 HDR 3.2 |