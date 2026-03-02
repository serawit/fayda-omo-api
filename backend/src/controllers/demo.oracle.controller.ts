import { Request, Response } from 'express';
import oracledb from 'oracledb';

export const createOracleCustomer = async (req: Request, res: Response) => {
  let connection;

  try {
    // 1. Get a connection from the global pool
    connection = await oracledb.getConnection();

    // 2. Prepare the SQL and Bind Variables
    // Using :variableName syntax prevents SQL Injection
    const sql = `
      INSERT INTO CUSTOMERS (FULL_NAME, PHONE_NUMBER, EMAIL, CREATED_AT)
      VALUES (:fullName, :phone, :email, SYSDATE)
      RETURNING CUSTOMER_ID INTO :outId
    `;

    const binds = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      outId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } // Define the out-bind
    };

    // 3. Execute the statement
    // IMPORTANT: You must set autoCommit: true, otherwise the data is not saved!
    const result = await connection.execute<any>(sql, binds, {
      autoCommit: true
    });

    // 4. Extract the returned ID from the outBinds property
    const newCustomerId = result.outBinds.outId[0];

    // 5. Return success
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      rowsAffected: result.rowsAffected, // Should be 1
      customerId: newCustomerId
    });

  } catch (error: any) {
    console.error('❌ Oracle Insert Error:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  } finally {
    // 5. Always close the connection
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracle connection:', err);
      }
    }
  }
};

export const updateOracleCustomer = async (req: Request, res: Response) => {
  let connection;

  try {
    connection = await oracledb.getConnection();

    // 1. Prepare the SQL and Bind Variables
    // Use the WHERE clause to target the specific record.
    const sql = `
      UPDATE CUSTOMERS
      SET FULL_NAME = :fullName, PHONE_NUMBER = :phone, EMAIL = :email
      WHERE CUSTOMER_ID = :id
    `;

    const binds = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      id: req.params.id // Assumes the ID is passed in the URL, e.g., /api/customers/123
    };

    // 2. Execute with autoCommit
    const result = await connection.execute(sql, binds, { autoCommit: true });

    // 3. Check if any rows were actually updated
    if (result.rowsAffected && result.rowsAffected > 0) {
      res.json({
        success: true,
        message: 'Customer updated successfully',
        rowsAffected: result.rowsAffected
      });
    } else {
      // This is important: if the ID doesn't exist, rowsAffected will be 0.
      res.status(404).json({ success: false, message: 'Customer not found' });
    }

  } catch (error: any) {
    console.error('❌ Oracle Update Error:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing Oracle connection:', err);
      }
    }
  }
};

export const getOracleCustomers = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT * FROM CUSTOMERS ORDER BY CREATED_AT DESC FETCH FIRST 20 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('❌ Oracle Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
};