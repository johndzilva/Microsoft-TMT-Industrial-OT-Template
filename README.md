# OT Threat Model Templates for Microsoft TMT (IEC 62443)

Two Microsoft Threat Modeling Tool (TMT) templates for **operational technology (OT)** and industrial control systems. Both use the same 80 OT stencils, next to TMT's own built-in stencils, so a diagram drawn with one template can be opened with the other.

| Template | Who uses it | Question it answers | Standards | Threats |
|---|---|---|---|---|
| **OT Product and System** | Product suppliers and system integrators | What must this PLC, gateway, SCADA package or control system resist, and which requirements does it need? | IEC 62443-4-2, 3-3, 4-1 | 100 |
| **OT Plant and Site Risk Assessment** | Asset owners and plant OT security teams | What can go wrong at this site, how bad would it be, and are the existing countermeasures enough? | IEC 62443-2-1, 3-2, 3-3, 2-4, IEC 61511 | 41 |

Every threat is mapped to **MITRE ATT&CK for ICS (v20)**, IEC 62443 references, a foundational requirement (FR1-FR7) and the lowest security level where it applies, and carries fields for 5x5 risk scoring and treatment.

**Tested with:** Microsoft Threat Modeling Tool 2016. Both templates open in the template editor with 0 validation messages.

## Which template to use

- Designing or certifying a **product** (IEC 62443-4-2 component) or a **system or solution** (IEC 62443-3-3): use the **Product and System** template. Threats are about design: authentication, firmware integrity, secure boot, protocol robustness, secure development.
- Assessing an **operating plant or site** (IEC 62443-3-2 zone and conduit risk assessment): use the **Plant and Site** template. Threats are about how the site is run: patching, remote and vendor access, segmentation, backups, monitoring, people, removable media and the process consequences of an attack.
- Doing both: model the product with the product template, and use its capability security level (SL-C) as an input to the plant assessment, where it is compared with the zone target (SL-T).

## Quick start

1. Install [Microsoft Threat Modeling Tool](https://aka.ms/threatmodelingtool).
2. Open TMT. Under **Template For New Models**, click **Browse** and select one of the two `.tb7` files.
3. Click **Create A Model**. The OT stencils appear in the Stencils pane next to Microsoft's.
4. Draw the system, set the element and flow properties (see below), then open **View > Analysis View** to see the generated threats.
5. Use **Reports > Create Full Report** for the threat report.

To switch an existing model to the other template, open it and use **File > Apply Template**. To look at or edit a template itself, use **Open Template**.

---

## Product and System template

### How to model

**Component model (IEC 62443-4-2)**
1. Draw a **Component or Device Boundary** around your product.
2. Inside it, split the product into its functions: for example a PLC runtime, its web interface, the firmware update service, the key store and the firmware image. Separate them with a **Process or Privilege Boundary** where relevant.
3. Outside it, add the people and systems the product talks to.
4. Every interface that crosses the device boundary receives the device-level threats (firmware integrity, default credentials, protocol fuzzing, supply chain and so on).

**System model (IEC 62443-3-3)**
1. Draw an **IEC 62443 Security Zone** per zone, plus a **Safety Zone SIS**, an **Industrial DMZ Level 3.5** and an **Enterprise or IT Zone**. Set the Purdue level and zone SL-T on each.
2. Use **IEC 62443 Conduit** and **Internet or Untrusted Network Boundary** lines for the paths between zones.
3. Pick the stencil that matches each device. Its IEC 62443-4-2 component type (EDR, HDR, NDR, SAR) is fixed by the stencil.

### Properties: they decide which threats appear

Every OT property starts at **Unknown**, which generates the threat. Set a property to **No** to remove threats that do not apply. With everything left at Unknown, expect about 20 threats per data flow. The last column lists the threats each value adds (Include rule) or removes (Exclude rule).

**Components and assets (processes)**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| IEC 62443-4-2 Component Type | IEC 62443-4-2 component class. Fixed by the stencil you pick (EDR embedded device, HDR host device, NDR network device, SAR software application) and decides which device-class threats apply. Only set it by hand on the Generic Process. | Not Selected, EDR - Embedded device, HDR - Host device, NDR - Network device, SAR - Software application | Through the stencil: the device-class threats |
| Security Level Target (SL-T IEC 62443) | Security level the component must meet (SL-T). Record it from the zone or from your product requirements. | Not Selected, SL 1, SL 2, SL 3, SL 4 | None (documentation only) |
| Performs Safety-Related Function (SIS or SIL) | Yes if the component performs or protects a safety function (SIS logic solver, safety I/O, a device that can cause a hazard). Adds the safety threats. | Unknown, Yes, No | Yes: adds OT-T10, OT-E04, OT-E05 |
| Reachable from Outside its Zone (remote or vendor access) | Yes if the component can be reached from outside its own zone, for example by VPN, remote desktop or a vendor connection. | Unknown, Yes, No | Yes: adds OT-S06 |
| Has Web or HTTP(S) Management Interface | Yes if the component has a web or HTTP(S) management or diagnostics interface, even if it is normally switched off. | Unknown, Yes, No | Yes: adds OT-E09, OT-S03, OT-I07 |
| Has Human User Accounts or Login | Yes if people log in to the component (local accounts, domain accounts, PIN). No if it has no human login at all; this removes the password threats. | Unknown, Yes, No | Unknown: adds OT-E06, OT-S13<br>Yes: adds OT-E06, OT-S13<br>No: removes OT-S04, OT-S05 |
| Stores Credentials Keys or Certificates | Yes if the component stores passwords, keys or certificates (for example for TLS, VPN or user login). No removes the key-extraction and weak-crypto threats. | Unknown, Yes, No | No: removes OT-I05, OT-I08 |
| Firmware or Software Updatable in the Field | Yes if firmware or software can be updated after installation. No removes the firmware and update threats. | Unknown, Yes, No | No: removes OT-T06, OT-D07 |
| Uses Third-Party or Open-Source Components | Yes if the component contains third-party or open-source software (RTOS, protocol stacks, libraries). Almost every product does. | Unknown, Yes, No | No: removes OT-T17 |
| Physical Debug or Service Ports (JTAG UART USB console) | Yes if the hardware has JTAG, UART console, USB service or test interfaces. No removes the debug-interface threat. | Unknown, Yes, No | No: removes OT-E03 |
| Installed in Physically Accessible or Unattended Location | Yes if the component is in a place where unauthorised people can reach it: field cabinet, remote or unattended site, open plant area. | Unknown, Yes, No | No: removes OT-T08 |
| Has Wireless Interface (Wi-Fi BT ISA100 WirelessHART cellular) | Yes if the component has any radio: Wi-Fi, Bluetooth, WirelessHART, ISA100, cellular. | Unknown, Yes, No | Yes: adds OT-I10, OT-S07, OT-D09 |
| Accepts Removable Media (USB SD card) | Yes if the component accepts USB drives, SD cards or other removable media. | Unknown, Yes, No | Yes: adds OT-T22 |
| Runs on Legacy or Unsupported OS or Runtime | Yes if it runs an operating system or runtime that is out of vendor support (for example Windows 7, old VxWorks). | Unknown, Yes, No | No: removes OT-E07 |

**Data flows**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Protocol Security in Use | The most important flow property. None: no authentication or encryption (Modbus, DNP3 without SA, OPC UA mode None). Integrity only: messages are authenticated or signed but readable. Integrity and encryption: authenticated and encrypted (TLS, OPC UA SignAndEncrypt, IPsec). | Unknown, None, Integrity only, Integrity and encryption | Unknown: adds OT-I02, OT-T02, OT-I15<br>None: adds OT-I02, OT-T02, OT-I15<br>Integrity only: adds OT-I02; removes OT-T01<br>Integrity and encryption: removes OT-T01, OT-I01 |
| Carries Control Commands Setpoints or Logic | Yes if the flow carries commands, setpoints, logic or configuration that change what the process or device does. No for read-only data such as status or reports. | Unknown, Yes, No | Unknown: adds OT-T02, OT-T03, OT-T04<br>Yes: adds OT-T02, OT-T03, OT-T04, OT-D14 |
| Carries Safety-Function Data | Yes if the flow carries safety-function data (trip signals, safety protocol frames). | Unknown, Yes, No | Yes: adds OT-T11, OT-D14 |
| Carries Credentials Keys or Sensitive IP | Yes if the flow carries passwords, keys or sensitive IP (for example a login, a project download). | Unknown, Yes, No | Unknown: adds OT-I02<br>Yes: adds OT-I02 |
| Physical Medium | How the flow physically travels. Cellular and Internet or WAN add the untrusted-network threats, Wireless the radio threats, Serial or fieldbus the rogue-master threat, Removable media the USB and transient-device threats. | Unknown, Wired Ethernet, Serial or fieldbus, Wireless, Cellular, Internet or WAN, Removable media or file transfer | Serial or fieldbus: adds OT-S02<br>Wireless: adds OT-I10, OT-S07, OT-D09<br>Cellular: adds OT-E15, OT-T29<br>Internet or WAN: adds OT-E15, OT-T29<br>Removable media or file transfer: adds OT-T22 |
| Generate Threats for this Flow | Set to No to switch off all OT threats for this flow, for example a flow you only drew for context. | Yes, No | No: removes every OT threat on the flow |

**External interactors**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Trust Level | How far the person or system is trusted. For documentation; it does not change the generated threats. | Unknown, Trusted internal, Semi-trusted third party, Untrusted | None (documentation only) |

**Data stores**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Contains Sensitive Data (credentials keys IP personal data) | Yes if the store holds credentials, keys, IP or personal data. | Unknown, Yes, No | Yes: adds OT-I11<br>No: removes OT-I12 |
| Contains Control-Critical Data (logic setpoints recipes config) | Yes if the store holds logic, setpoints, recipes or configuration that the process depends on. | Unknown, Yes, No | Yes: adds OT-T23 |

**Zones (border boundaries)**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Purdue or ISA-95 Level | Purdue / ISA-95 level of the zone. For documentation; TMT cannot use zone properties in threat rules. | Not Selected, Level 0 - Process, Level 1 - Basic control, Level 2 - Supervisory, Level 3 - Site operations, Industrial DMZ, Level 4 and 5 - Enterprise, Cloud or external | None (documentation only) |
| Zone Security Level Target (SL-T) | Target security level of the zone (SL-T), from the IEC 62443-3-2 risk assessment. For documentation. | Not Selected, SL 1, SL 2, SL 3, SL 4 | None (documentation only) |

Microsoft's stencils keep their own properties. HTTPS and IPsec flows are marked as integrity and confidentiality protected (Microsoft properties *Provides Integrity* and *Provides Confidentiality*), so they skip OT-T01, OT-I01 and OT-I02. Device-level threats only appear on exposed interfaces: flows that cross a trust boundary or come from an external interactor.

### Threat properties

| Property | Content |
|---|---|
| Priority | High / Medium / Low |
| Possible Mitigation(s) | Recommended controls |
| MITRE ATTACK for ICS v20 | Related techniques (v20 IDs, e.g. T1692.001) |
| IEC 62443 Requirement(s) | 4-2 CR / 3-3 SR / 4-1 references; the first belongs to the stated FR |
| IEC 62443 Foundational Requirement | FR1 to FR7 |
| Relevant from SL | Lowest SL-T at which countermeasures are normally required |
| OT Consequence | Safety, environment, equipment, production, view or control, IP |
| Likelihood (1-5), Impact (1-5), Risk Rating, Risk Treatment | 5x5 risk assessment |
| Implemented Mitigation(s), Verification Evidence, Owner | Treatment record |

In **Analysis View**, set each threat's status (Not Started, Needs Investigation, Not Applicable, Mitigated), then fill in the risk fields. Risk rating (5x5): **Critical 20-25, High 12-19, Medium 6-11, Low 1-5**.

### Example: industrial edge gateway (component model)

`examples/Industrial Edge Gateway - Product Threat Model.tm7` models an industrial IoT edge gateway as an IEC 62443-4-2 component. A **Component or Device Boundary** surrounds the product; its functions are inside, and everything it talks to is outside. Opened in TMT it generates about **230 threats** (predicted with `predict.py`).

| Where | Elements |
|---|---|
| Inside the product boundary | Southbound Protocol Service, Container Runtime and Apps (behind a **Container isolation** privilege boundary), Cloud Connector, Web Management UI, Gateway Firmware and OS, Firmware Update Agent, Gateway Configuration, Local Audit Log, Key Store in TPM, Firmware Image A and B |
| Vendor and cloud (beyond an **Internet** boundary) | Cloud IoT Platform, Vendor Update Server |
| Plant side | Machine PLCs and Drives, Maintenance Engineer, Vendor Service Technician, USB Stick for Configuration Import, Site Time Server |

- Machines are polled over **Modbus TCP without security**; telemetry, commands and app deployments use **MQTT over TLS**; firmware is downloaded over HTTPS, verified and written to an A/B image; keys are in a TPM.
- The hardware platform is set as **physically exposed** (machine cabinet), with **debug ports**, **USB** and a **wireless** interface, so the device-level threats (secure boot, debug interfaces, physical tampering, key extraction) appear on its external interfaces: the SSH service shell (37 threats) and time synchronisation (35).
- The example shows the newer product threats: build pipeline compromise (OT-T28), code-signing key misuse (OT-S12), rogue MQTT clients (OT-T29), container escape (OT-E19), compromised update channel (OT-T21), cloud-originated commands (OT-T25).

### Industry coverage (product template)

Tested with one reference architecture per industry, run through the template's own threat rules. Overall score = 50% attack-scenario coverage + 25% asset fit + 25% protocol fit (October 2026).

| Industry | Overall | Rating |
|---|---|---|
| Chemical, refining, process | 96% | Strong |
| Water and wastewater | 88% | Strong |
| Oil and gas, pipelines | 84% | Good |
| Power transmission and distribution | 80% | Good |
| Discrete manufacturing, automotive | 77% | Good |
| Pharma, food and beverage (batch) | 70% | Moderate |
| Power generation, renewables (DER) | 69% | Moderate |
| Rail and urban transit | 60% | Moderate |
| Maritime and ports | 56% | Limited |
| Building automation, data centres | 53% | Limited |

Every attack scenario the template should cover produced a matching threat. The lower scores come from missing sector protocols (ICCP, IEEE C37.118, FOUNDATION Fieldbus, EtherCAT, KNX, NMEA), sector-specific assets (interlocking, ship systems, access control) and unmapped sector standards (NERC CIP, IACS UR E26/E27, CLC/TS 50701, 21 CFR Part 11).

---

## Plant and Site Risk Assessment template

### What it is for

An asset owner's cybersecurity risk assessment of an operating plant, following the IEC 62443-3-2 zone and conduit process. The threats ask how the site is protected and run, not how the products were designed:

- **Zones and conduits:** unfiltered inter-zone flows, unauthenticated control traffic between zones, paths from the business network or the Internet to controllers, unmanaged cellular routers, wireless.
- **Remote and third-party access:** stolen remote access credentials, always-on vendor connections, remote takeover of operator sessions, work by integrators without security requirements.
- **Assets:** unpatched and end-of-life systems, missing malware protection, unhardened configuration, shared and leftover accounts, no monitoring, no tested backup, capability below the zone target (SL-C < SL-T), ransomware spread.
- **Operations and process:** attacks that could drive the process to a hazardous state, unmanaged logic changes, safety system compromise and SIS independence, loss of view without manual fallback, alarm suppression, permissive firewall rules, IT scanning of fragile devices.
- **People, media and data:** USB media and visiting laptops, phishing, insider misuse, untraceable actions, theft of plant documentation, backups encrypted together with the plant, unreviewed alerts, physical access at unattended sites, cloud service compromise.

References use IEC 62443-2-1:2024 programme elements (for example `2-1 NET 3` secure remote access, `2-1 COMP 3` patch management), IEC 62443-2-4 service provider capabilities (`2-4 SP.07` remote access), IEC 62443-3-2 (`3-2 ZCR 5` detailed risk assessment), IEC 62443-3-3 system requirements and IEC 61511-1 clause 8.2.4 (SIS security risk assessment).

### How to model (IEC 62443-3-2)

1. **System under consideration (ZCR 1):** draw the assets of the site with the same stencils as the product template.
2. **Zones and conduits (ZCR 3):** draw each zone as a border boundary and connect zones only through the flows that really exist.
3. **Zone properties:** set Purdue level, **zone SL-T**, **worst-case consequence of zone compromise**, whether the zone has safety or environmental functions, **physical access** and the **achieved security level (SL-A)**. These record the inputs to the risk assessment; they do not change the generated threats.
4. **Asset properties:** set the site state of each asset (patch status, hardening, malware protection, shared accounts, monitoring, tested backup, SL-C meets zone SL-T, worst-case consequence). These decide which threats appear.
5. **Flow properties:** protocol security, whether the flow passes a firewall or conduit device, whether the connection is permanent.
6. **Analysis View (ZCR 5):** for each threat record existing countermeasures, severity and likelihood, current risk, whether it is within tolerable risk, the treatment, planned countermeasures and residual risk.

### Properties added by the plant template

All product properties are kept and still work as described above. The plant threats also use these of them: Performs Safety-Related Function (SIS or SIL), Has Human User Accounts or Login, Installed in Physically Accessible or Unattended Location, Has Wireless Interface (Wi-Fi BT ISA100 WirelessHART cellular), Runs on Legacy or Unsupported OS or Runtime, Protocol Security in Use, Carries Control Commands Setpoints or Logic, Physical Medium. These properties are added for the site assessment:

**Components and assets (processes)**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Patch Status | Up to date: current vendor-approved patches installed. Patches pending: known patches not yet installed. End of life or unpatchable: no more vendor fixes. Unknown counts as not patched. | Unknown, Up to date, Patches pending, End of life or unpatchable | Unknown: adds PL-E06<br>Patches pending: adds PL-E06<br>End of life or unpatchable: adds PL-E07 |
| Hardened to Site Security Baseline | Yes if the asset is configured to the site security baseline (unused services, ports and accounts removed, vendor hardening guide applied). | Unknown, Yes, No | Unknown: adds PL-E08<br>No: adds PL-E08 |
| Malware Protection or Application Allow-listing | Yes if anti-malware or application allow-listing is installed and maintained. Not applicable for devices that cannot run it (PLCs, drives). | Unknown, Yes, No, Not applicable | Unknown: adds PL-T04<br>No: adds PL-T04 |
| Shared or Generic Accounts in Use | Yes if people log in with default, shared or generic accounts (for example 'operator', 'admin'). | Unknown, Yes, No | Unknown: adds PL-S03, PL-R02<br>Yes: adds PL-S03, PL-R02 |
| Logs or Traffic Monitored by Security Team | Yes if the asset's security events are collected and someone reviews them, or its network traffic is monitored by an OT IDS. | Unknown, Yes, No | Unknown: adds PL-R01<br>No: adds PL-R01 |
| Backup Exists and Restore Tested | Yes only if a current backup exists and a restore has actually been tested. | Unknown, Yes, No | Unknown: adds PL-D02<br>No: adds PL-D02 |
| Component Capability (SL-C) Meets Zone SL-T | Yes if the asset's capability security level (SL-C, from the supplier's IEC 62443-4-2 certificate or assessment) is at least the zone's SL-T. | Unknown, Yes, No | Unknown: adds PL-E09<br>No: adds PL-E09 |
| Worst-Case Consequence if Compromised | Worst credible consequence if an attacker controls this asset, on the site risk matrix. Major or Catastrophic adds the hazardous-process-state threat for controllers. | Not assessed, Negligible, Minor, Moderate, Major, Catastrophic | Not assessed: adds PL-T05<br>Major: adds PL-T05<br>Catastrophic: adds PL-T05 |

**Data flows**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Filtered by Firewall or Conduit Device | Yes if the flow passes a firewall, data diode or other conduit device that only allows this traffic. Only matters for flows that cross a zone boundary. | Unknown, Yes, No | Unknown: adds PL-E01<br>No: adds PL-E01 |
| Connection Is Permanent (not on demand) | Yes if the connection is always up. No if it is set up only when needed (on demand). | Unknown, Yes, No | Unknown: adds PL-E05<br>Yes: adds PL-E05 |

**External interactors**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Third Party or Remote Access | How this third party or remote user gets access. On request approved and recorded: enabled only when needed, approved and logged. Always on or unsupervised: can connect at any time. | Unknown, On request approved and recorded, Always on or unsupervised, Not applicable | Unknown: adds PL-E05<br>Always on or unsupervised: adds PL-E05 |
| Security Awareness Training Completed | Yes if this group has completed OT security awareness training. | Unknown, Yes, No | Unknown: adds PL-S05<br>No: adds PL-S05 |

**Data stores**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Offline or Immutable Copy Exists | Yes if at least one backup copy is offline or immutable, so ransomware cannot reach it. | Unknown, Yes, No | No: removes PL-D07 |

**Zones (border boundaries)**

| Property | What it means and how to set it | Values | Threats affected |
|---|---|---|---|
| Worst-Case Consequence of Zone Compromise | Worst credible consequence of a compromise of the whole zone. Input to SL-T (IEC 62443-3-2 ZCR 5); for documentation. | Not assessed, Negligible, Minor, Moderate, Major, Catastrophic | None (documentation only) |
| Zone Contains Safety or Environmental Functions | Yes if the zone contains safety or environmental protection functions. For documentation. | Unknown, Yes, No | None (documentation only) |
| Physical Access to Zone | Who can physically reach the zone. For documentation; for threats, set Physically Exposed on the assets. | Unknown, Controlled and monitored, Controlled, Uncontrolled or unattended | None (documentation only) |
| Achieved Security Level (SL-A) | Security level the zone actually achieves today (SL-A). Compare with SL-T to find the gap. For documentation. | Not assessed, SL 0, SL 1, SL 2, SL 3, SL 4 | None (documentation only) |

Zone properties record the inputs to the IEC 62443-3-2 risk assessment. TMT can only use the properties of the two ends of a flow and of the flow itself in threat rules, so zone properties do not change the generated threats.

### Threat properties and scoring

| Property | Content |
|---|---|
| Priority | High / Medium / Low |
| Recommended Countermeasure(s) | Typical asset-owner countermeasures |
| MITRE ATTACK for ICS v20 | Related techniques |
| IEC 62443 and IEC 61511 Reference(s) | 3-3 SR, 2-1 element, 2-4 SP, 3-2 ZCR, IEC 61511 |
| IEC 62443 Foundational Requirement, Relevant from SL, OT Consequence | Classification |
| Existing Countermeasures | What the site already has in place |
| HAZOP or Cyber HAZOP Reference | Link to the process hazard scenario |
| Consequence Category | Health and safety, environment, production loss, equipment damage, product quality, regulatory or reputation, financial |
| Consequence Severity (1-5), Likelihood (1-5) | Negligible to catastrophic; rare to almost certain |
| Current Risk, Within Tolerable Risk | Severity x likelihood with existing countermeasures, compared with the site's criteria |
| Risk Treatment, Planned Countermeasure(s), Residual Risk | Treatment decision and expected result |
| Action Owner, Due Date, Verification Evidence | Action tracking |

### Example: natural gas pipeline

`examples/Gas Pipeline - Site Risk Assessment.tm7` is a natural gas transmission pipeline assessed with the plant template. Opened in TMT it generates about **108 threats** (predicted with `predict.py`).

| Zone (consequence, physical access, SL-T / SL-A) | Elements |
|---|---|
| Enterprise IT - Level 4 (minor) | Corporate IT and Gas Scheduling |
| Control Centre DMZ - Level 3.5 (moderate) | Remote Access Gateway, DMZ Historian |
| Pipeline Control Centre - Level 2 and 3 (major, SL-T 2 / SL-A 2) | Pipeline SCADA Server, Pipeline Controller HMI, Engineering Workstation, Leak Detection System (end of life), Pipeline Historian Database |
| Compressor Station - Level 1 and 0 (catastrophic, unattended, SL-T 2 / SL-A 1) | Station Cellular Router, Station RTU, Compressor Unit Control PLC, Compressor Unit and Station Piping |
| Station Safety Zone - ESD (catastrophic, unattended, SL-T 3 / SL-A 1) | Station ESD System |
| Block Valve Site - Level 1 (major, unattended, SL-T 2 / SL-A 0) | Valve Site RTU, Mainline Valve Actuator |
| Outside the zones | Compressor OEM Remote Support (always-on VPN), Pipeline Controller, Field Technician Laptop |

What the assessment brings out:
- **Remote sites over public networks:** station telemetry runs DNP3 without security over a public cellular network (16 threats), the valve site over licensed radio (13).
- **Business dependency:** gas nominations come straight from the corporate scheduling system into SCADA without a conduit device, the IT-to-OT dependency behind the 2021 Colonial Pipeline shutdown (PL-E01, PL-E02).
- **Safety:** the compressor PLC can reset the ESD remotely, so the safety system is reachable from the control side (PL-E10, PL-T07); a catastrophic worst-case consequence adds the hazardous process state threat (PL-T05) on the compressor and valve controls.
- **Site practice:** shared accounts and unhardened RTUs and PLCs, no security monitoring at the remote sites, an always-on OEM VPN (PL-E05), a field technician laptop used for PLC programming (PL-T09).

---

## Stencils (both templates)

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

## Threat catalogue: Product and System (100 threats)

In TMT the titles name the actual source and target elements.

| ID | STRIDE | Threat | Priority | From SL | ATT&CK for ICS (first) | Primary reference |
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

## Threat catalogue: Plant and Site (41 threats)

| ID | STRIDE | Threat | Priority | From SL | ATT&CK for ICS (first) | Primary reference |
|---|---|---|---|---|---|---|
| PL-S01 | Spoofing | Rogue device on the wireless network used by target | High | SL 2 | T0860 Wireless Compromise | 3-3 SR 1.6 |
| PL-S02 | Spoofing | Stolen or reused credentials used for remote access by source | High | SL 2 | T0822 External Remote Services | 3-3 SR 1.13 |
| PL-S03 | Spoofing | Default, shared or generic accounts in use on target | High | SL 1 | T1694.001 Insecure Credentials: Default Credentials | 3-3 SR 1.1 |
| PL-S04 | Spoofing | Leavers' and contractors' accounts still active on target | Medium | SL 1 | T0859 Valid Accounts | 3-3 SR 1.3 |
| PL-S05 | Spoofing | source tricked into giving access to target | Medium | SL 1 | T0865 Spearphishing Attachment | 2-1 ORG 1 |
| PL-T01 | Tampering | Unauthenticated control traffic from source to target crosses zones | High | SL 2 | T1692.001 Unauthorized Message: Command Message | 3-3 SR 3.1 |
| PL-T02 | Tampering | Remote takeover of the operator or engineering session on target | High | SL 2 | T0822 External Remote Services | 3-3 SR 2.1 |
| PL-T03 | Tampering | Changes by source to target not covered by security requirements | Medium | SL 1 | T0862 Supply Chain Compromise | 2-4 SP.02 |
| PL-T04 | Tampering | Malware can run on target | High | SL 1 | T0863 User Execution | 3-3 SR 3.2 |
| PL-T05 | Tampering | Cyber attack on target could drive the process to a hazardous state | High | SL 2 | T0831 Manipulation of Control | 3-3 SR 3.6 |
| PL-T06 | Tampering | Unauthorised or unmanaged change to logic or configuration of target | High | SL 1 | T0889 Modify Program | 3-3 SR 2.1 |
| PL-T07 | Tampering | Safety function target disabled or altered by a cyber attack | High | SL 3 | T0880 Loss of Safety | IEC 61511-1 8.2.4 |
| PL-T08 | Tampering | Alarms on target suppressed or not acted on | Medium | SL 2 | T0878 Alarm Suppression | 3-3 SR 2.1 |
| PL-T09 | Tampering | Malware brought to target on USB media or a visiting laptop | High | SL 1 | T0847 Replication Through Removable Media | 3-3 SR 2.3 |
| PL-T10 | Tampering | Physical access to target at an unattended or open location | Medium | SL 2 | T0864 Transient Cyber Asset | 3-3 SR 2.3 |
| PL-R01 | Repudiation | Attacks on target would not be detected | Medium | SL 2 | T0872 Indicator Removal on Host | 3-3 SR 6.2 |
| PL-R02 | Repudiation | Actions by source on target cannot be traced to a person | Medium | SL 1 | T0859 Valid Accounts | 3-3 SR 2.8 |
| PL-R03 | Repudiation | Security alerts from source not reviewed or acted on | Medium | SL 2 | T0872 Indicator Removal on Host | 3-3 SR 6.1 |
| PL-I01 | Information disclosure | Plant data between source and target readable in transit | Medium | SL 2 | T0842 Network Sniffing | 3-3 SR 4.1 |
| PL-I02 | Information disclosure | target discoverable from the Internet or a carrier network | High | SL 1 | T0883 Internet Accessible Device | 3-3 SR 5.2 |
| PL-I03 | Information disclosure | Plant drawings, programs or process history stolen from target | Medium | SL 2 | T0882 Theft of Operational Information | 3-3 SR 4.1 |
| PL-D01 | Denial of service | Carrier or WAN outage cuts source from target | Medium | SL 1 | T1695.002 Block Communications: Ethernet | 3-3 SR 7.1 |
| PL-D02 | Denial of service | target cannot be restored quickly after ransomware or failure | High | SL 1 | T0809 Data Destruction | 3-3 SR 7.3 |
| PL-D03 | Denial of service | Ransomware spreads to target and stops operations | High | SL 1 | T0809 Data Destruction | 3-3 SR 5.1 |
| PL-D04 | Denial of service | Loss of view or control on target without a manual fallback | High | SL 1 | T0829 Loss of View | 3-3 SR 7.1 |
| PL-D05 | Denial of service | Failure of target cuts essential communication | Medium | SL 1 | T0814 Denial of Service | 3-3 SR 7.1 |
| PL-D06 | Denial of service | IT security scanning from source disrupts target | Medium | SL 1 | T0814 Denial of Service | 3-3 SR 7.1 |
| PL-D07 | Denial of service | Backups in target encrypted or deleted together with the plant systems | High | SL 1 | T0809 Data Destruction | 3-3 SR 7.3 |
| PL-E01 | Elevation of privilege | source to target crosses a zone boundary without a conduit device | High | SL 1 | T0886 Remote Services | 3-3 SR 5.1 |
| PL-E02 | Elevation of privilege | Attack path from the business network via source to target | High | SL 1 | T0886 Remote Services | 3-3 SR 5.1 |
| PL-E03 | Elevation of privilege | Controller target reachable from outside the plant | High | SL 1 | T0883 Internet Accessible Device | 3-3 SR 5.1 |
| PL-E04 | Elevation of privilege | Unmanaged or undocumented WAN or cellular connection at target | High | SL 1 | T0822 External Remote Services | 3-3 SR 5.2 |
| PL-E05 | Elevation of privilege | Always-on or unsupervised access by source | High | SL 2 | T0822 External Remote Services | 3-3 SR 2.6 |
| PL-E06 | Elevation of privilege | Known vulnerabilities on target not patched | High | SL 1 | T0866 Exploitation of Remote Services | 3-3 SR 3.2 |
| PL-E07 | Elevation of privilege | target is end of life and cannot be secured by patching | High | SL 1 | T0866 Exploitation of Remote Services | 2-1 COMP 3 |
| PL-E08 | Elevation of privilege | target runs with default or unhardened configuration | Medium | SL 1 | T0866 Exploitation of Remote Services | 3-3 SR 7.7 |
| PL-E09 | Elevation of privilege | Security capability of target is below the zone target | Medium | SL 2 | T0866 Exploitation of Remote Services | 3-3 SR 5.2 |
| PL-E10 | Elevation of privilege | Safety system target reachable from the control zone | High | SL 3 | T0880 Loss of Safety | 3-3 SR 5.1 |
| PL-E11 | Elevation of privilege | Conduit rules on target too permissive or not reviewed | High | SL 1 | T0884 Connection Proxy | 3-3 SR 5.2 |
| PL-E12 | Elevation of privilege | Insider misuse of privileges by source on target | Medium | SL 2 | T0859 Valid Accounts | 3-3 SR 2.1 |
| PL-E13 | Elevation of privilege | Compromise of cloud or vendor service source affects target | Medium | SL 2 | T0862 Supply Chain Compromise | 3-3 SR 5.2 |